import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { getDatabase, set, ref, onValue, remove } from 'firebase/database';

import { firebaseConfig } from '../config/firebase-config';
import { userIn } from '../js/authorization-button';
import { parseFavCoctails } from '../js/fav-coctails';
import { parseFavIngridients } from '../js/fav-ingridients';

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
const provider = new GoogleAuthProvider();
const database = getDatabase();

export const signUp = () => {
  signInWithPopup(auth, provider);
};

export const quitAcc = () => {
  signOut(auth);
};

onAuthStateChanged(auth, user => {
  getDataArrfromDb(user, '/coctailes', 'cockteileId', parseFavCoctails);
  getDataArrfromDb(user, '/ingredients', 'ingredientName', parseFavIngridients);
  userIn('enable');
  if (!user) {
    userIn('disable');
  }
});

export function writeUserData(userId, elementId, way, data = {}) {
  if (userId) {
    set(ref(database, `${userId}/${way}/` + elementId), data);
  }
}
export function removeUserData(userId, elementId, way, data = {}) {
  if (userId) {
    remove(ref(database, `${userId}/${way}/` + elementId), data);
  }
}

export function getDataArrfromDb(user, way, searchKey, callback) {
  onValue(ref(database, user?.uid + way), snapshot => {
    const data = snapshot.val();
    if (data) {
      const favoriteIngridientsRawArr = Object.values(data);
      const favoriteArr = favoriteIngridientsRawArr.map(id => id[searchKey]);
      callback(favoriteArr);
    }
  });
}
export function checkedBtns(
  selector,
  itemsArr,
  dataKey,
  attribute,
  { atrOnDel, atrOnAdd },
  { contOnDel, ContOnAdd }
) {
  onAuthStateChanged(auth, user => {
    if (user) {
      const checkedBtn = document.querySelectorAll(selector);
      onValue(ref(database, user?.uid + itemsArr), snapshot => {
        const data = snapshot.val();
        if (data) {
          const favoriteIngridientsRawArr = Object.keys(data);
          checkedBtn.forEach(id => {
            const isFav = favoriteIngridientsRawArr.includes(
              id.dataset[dataKey]
            );
            if (isFav) {
              id.setAttribute(attribute, atrOnDel);
              id.textContent = contOnDel;
            } else {
              id.setAttribute(attribute, atrOnAdd);
              id.textContent = ContOnAdd;
            }
          });
        }
      });
    }
  });
}
