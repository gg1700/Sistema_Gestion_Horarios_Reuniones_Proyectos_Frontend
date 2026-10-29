import test, { before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

let dom, server, React, act, createRoot, MemoryRouter, Routes, Route, Picker, PublicPage, VisibilityPage, AppProviders, MockFlowProvider, IdentityProvider, MemberShell;
let root, container, responder, requests;
const originalFetch=globalThis.fetch;
const catalogue = () => ({ username:'ana',maxSelected:2,selectedIds:[1,2],warnings:[],repositories:[1,2,3,4].map(id=>({id,name:`proyecto-${id}`,description:null,language:null,stars:id,url:`https://github.com/ana/proyecto-${id}`,visibility:id===4?'private':'public',private:id===4,selected:id<3,selectionId:id<3?`selection-${id}`:null,visible:false})) });
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const publicData = {handleName:'ana-perez',name:'Ana',firstSurname:'Pérez',firstLastName:'Pérez',profilePicture:null,countries:[{countryName:'Bolivia'}],workExperiences:[{title:'Frontend',companyName:'Nexo',description:'Interfaces',startDate:'2024-03-01',endDate:null}],links:[{text:'Portafolio',url:'https://ana.example.test'}],repositories:[{name:'orbitia-real',description:null,language:null,stars:12,url:'https://github.com/ana/orbitia-real'}]};
before(async () => {
  dom=new Window({url:'http://localhost/'});
  for(const key of ['window','document','navigator','HTMLElement','HTMLDialogElement','Element','Node','Event','MouseEvent','sessionStorage']) Object.defineProperty(globalThis,key,{configurable:true,value:key==='window'?dom:dom[key]});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  dom.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  React=await import('react');act=React.act;({createRoot}=await import('react-dom/client'));({MemoryRouter,Routes,Route}=await import('react-router'));
  server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
  ({RepositoryPicker:Picker}=await server.ssrLoadModule('/src/features/github/RepositoryPicker.tsx'));
  ({default:PublicPage}=await server.ssrLoadModule('/src/pages/ProfilePublicPage.tsx'));
  ({default:VisibilityPage}=await server.ssrLoadModule('/src/features/github/ProfileVisibilityPage.tsx'));
  ({AppProviders}=await server.ssrLoadModule('/src/contexts/AppProviders.tsx'));
  ({MockFlowProvider}=await server.ssrLoadModule('/src/contexts/MockFlowContext.tsx'));
  ({MemberIdentityProvider:IdentityProvider}=await server.ssrLoadModule('/src/features/github/MemberIdentityContext.tsx'));
  ({MemberShell}=await server.ssrLoadModule('/src/components/features/flows/FlowShell.tsx'));
});
beforeEach(()=>{
  dom.sessionStorage.clear();requests=[];
  responder=()=>json({success:true,data:catalogue()});
  globalThis.fetch=async(url,init={})=>{requests.push({url:String(url),...init});return responder(String(url),init);};
  container=dom.document.createElement('div');dom.document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(()=>root.unmount());container.remove();});
after(async()=>{globalThis.fetch=originalFetch;await server.close();await dom.happyDOM.close();});
async function mount(element,url='/perfil/conexiones/github'){
  await act(async()=>root.render(React.createElement(AppProviders,null,React.createElement(MockFlowProvider,null,React.createElement(MemoryRouter,{initialEntries:[url]},element)))));
}
const button=label=>{const result=[...dom.document.querySelectorAll('button')].find(item=>item.textContent.trim()===label);assert.ok(result,`botón ${label}`);return result;};
async function click(element){await act(async()=>element.click());}

test('selector bloquea privados, respeta límite del backend y tolera nulos',async()=>{
  await mount(React.createElement(Picker,{data:catalogue(),onClose(){},onSaved(){}}));
  const boxes=dom.document.querySelectorAll('input[type=checkbox]');
  assert.equal(boxes[3].disabled,true);
  await click(boxes[2]);
  assert.match(dom.document.body.textContent,/hasta 2 repositorios/);
  assert.match(dom.document.body.textContent,/Sin descripción/);
  assert.match(dom.document.body.textContent,/Lenguaje no especificado/);
});
test('cancelar descarta el borrador sin escribir al backend',async()=>{
  let closed=false;
  await mount(React.createElement(Picker,{data:catalogue(),onClose(){closed=true;},onSaved(){}}));
  await click(dom.document.querySelector('input[type=checkbox]'));
  await click(button('Cancelar'));
  assert.equal(closed,true);assert.equal(requests.length,0);
});
test('reordenar guarda IDs numéricos en orden y usa cookies',async()=>{
  let saved=false;
  await mount(React.createElement(Picker,{data:catalogue(),onClose(){},onSaved(){saved=true;}}));
  await click(dom.document.querySelector('[aria-label="Subir 2"]'));
  await click(button('Guardar selección'));
  assert.equal(saved,true);
  assert.deepEqual(JSON.parse(requests[0].body),{repositoryIds:[2,1]});
  assert.equal(requests[0].credentials,'include');
  assert.match(requests[0].url,/integrations\/github\/repositories\/selected$/);
});
test('error de guardado conserva el borrador y el modal',async()=>{
  responder=()=>json({success:false,message:'GitHub alcanzó su límite.'},429);
  let saved=false;
  await mount(React.createElement(Picker,{data:catalogue(),onClose(){},onSaved(){saved=true;}}));
  await click(button('Guardar selección'));
  assert.equal(saved,false);assert.match(dom.document.body.textContent,/alcanzó su límite/);
  assert.equal(dom.document.querySelectorAll('input:checked').length,2);
  assert.ok(dom.document.querySelector('dialog[open]'));
});
test('visitante muestra datos reales completos, nulos y enlaces al handle recibido',async()=>{
  responder=()=>json({success:true,data:publicData});
  await mount(React.createElement(Routes,null,React.createElement(Route,{path:'/:publicHandle',element:React.createElement(PublicPage)})),'/ana-perez');
  for(const value of ['Ana Pérez','Bolivia','Frontend','Nexo','Portafolio','orbitia-real','12','Actualidad','Sin descripción']) assert.ok(dom.document.body.textContent.includes(value),value);
  assert.ok(dom.document.querySelector('a[href="/ana-perez/disponibilidad"]'));
  assert.ok(!dom.document.body.textContent.includes('Mateo'));
  assert.equal(requests.length,1);
});
test('perfil 404 muestra indisponibilidad y nunca sustituye por una maqueta',async()=>{
  responder=()=>json({success:false,message:'Perfil no encontrado.'},404);
  await mount(React.createElement(Routes,null,React.createElement(Route,{path:'/:publicHandle',element:React.createElement(PublicPage)})),'/inexistente');
  assert.ok(!dom.document.body.textContent.includes('Mateo'));
  assert.ok(!dom.document.body.textContent.includes('Proyectos compartidos'));
});
test('cabecera usa identidad real y cerrar sesión retira la cookie en servidor',async()=>{
  responder=(url,init)=>init.method==='POST'?new Response(null,{status:204}):json({success:true,data:{...publicData,email:'ana@example.test'}});
  await mount(React.createElement(IdentityProvider,null,React.createElement(MemberShell,null,'Contenido privado')));
  assert.match(dom.document.body.textContent,/Ana Pérez/);
  assert.ok(!dom.document.body.textContent.includes('Mateo'));
  await click(dom.document.querySelector('[aria-label="Abrir cuenta de Ana Pérez"]'));
  await click(button('Cerrar sesión'));
  const logout=requests.find(item=>item.url.endsWith('/auth/logout'));
  assert.equal(logout.method,'POST');assert.equal(logout.credentials,'include');
});
test('sesión inválida no muestra identidad o contenido de demostración',async()=>{
  responder=()=>json({success:false,message:'Sesión expirada.'},401);
  await mount(React.createElement(IdentityProvider,null,React.createElement(MemberShell,null,'Contenido privado')));
  assert.ok(!dom.document.body.textContent.includes('Contenido privado'));
  assert.ok(!dom.document.body.textContent.includes('Mateo'));
  assert.match(dom.document.body.textContent,/Sesión expirada/);
});
test('visibilidad usa UUID de selección y la vista previa omite email de acceso',async()=>{
  const own={...publicData,id:'user-1',email:'login-secret@example.test',countries:[],workExperiences:[],links:[],contactEmails:[],phones:[],addresses:[]};
  responder=(url,init)=>init.method==='PATCH'?json({success:true}):json({success:true,data:url.endsWith('/profile')?own:catalogue()});
  await mount(React.createElement(VisibilityPage));
  await click(dom.document.querySelector('input[type=checkbox]'));
  await click(button('Guardar cambios'));
  const write=requests.find(item=>item.method==='PATCH');
  assert.deepEqual(JSON.parse(write.body).changes[0],{type:'repository',id:'selection-1',visible:true});
  await click(button('Vista previa'));
  assert.ok(!dom.document.querySelector('dialog[open]').textContent.includes('login-secret'));
  assert.match(dom.document.querySelector('dialog[open]').textContent,/proyecto-1/);
});
