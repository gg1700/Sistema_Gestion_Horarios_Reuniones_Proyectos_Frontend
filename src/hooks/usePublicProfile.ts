import { useParams } from 'react-router';
import { mockPublicProfiles } from '../mocks/publicProfiles';

function usePublicProfile() {
  const { publicHandle } = useParams<{ publicHandle: string }>();

  const handleName = (publicHandle ?? '')
    .replace(/^@/, '')
    .toLowerCase();

  const account = mockPublicProfiles[handleName];

  const profile = account?.active ? account.profile : null;

  return {
    handleName,
    profile,
  };
}

export default usePublicProfile;
