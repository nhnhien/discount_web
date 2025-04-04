import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from '@/context/slice/auth';
import { syncUser } from '@/services/userService';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useAuthSync = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const user = await syncUser(idToken); // gọi API để lấy user + role
          dispatch(loginSuccess(user)); // lưu vào Redux
        } catch (error) {
          console.error('❌ useAuthSync error:', error);
        }
      } else {
        dispatch(logoutSuccess()); // nếu user logout
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { loading };
};

export default useAuthSync;