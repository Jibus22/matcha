import { BehaviorSubject, map } from "rxjs";
import { IFullUser } from "../models/user";
import { gender$ } from "../routes/register/store/gender.rxjs";
import { biography$ } from "../routes/register/store/biography.rxjs";
import { sexPreference$ } from "../routes/register/store/sexPreference.rxjs";
import { birthdate$ } from "../routes/register/store/birthdate.rxjs";
import { interests$ } from "../routes/register/store/interests.rxjs";
import { photos$ } from "../routes/register/store/photos.rxjs";
import { IndexableType } from "dexie";

let user: Omit<Required<IFullUser>, "id"> & { id?: IndexableType } = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  username: "",
  gender: "",
  sexual_preference: "",
  biography: "",
  age: "",
  fame_rating: 5,
  interests: [],
  photos: [],
};

export const user$ = new BehaviorSubject<IFullUser>(user);

export const getUser = () => {
  return { ...user };
};

export const updateUser = (userUp: Partial<IFullUser>) => {
  user = { ...user, ...userUp };
  user$.next(user);
};

birthdate$.subscribe((newBd) => {
  user.age = newBd;
  user$.next(user);
});

gender$.subscribe((newGender) => {
  user.gender = newGender;
  user$.next(user);
});

sexPreference$
  .pipe(
    map((sp) =>
      sp.size === 1
        ? [...sp][0] === user.gender
          ? "homosexual"
          : "heterosexual"
        : "bisexual"
    )
  )
  .subscribe((sp) => {
    user.sexual_preference = sp;
    user$.next(user);
  });

biography$.subscribe((newBio) => {
  user.biography = newBio;
  user$.next(user);
});

interests$.subscribe((interests) => {
  user.interests = [...interests];
  user$.next(user);
});

photos$
  .pipe(
    map((photos) => {
      const avatar = photos.find((photo) => photo.isAvatar === true);
      const noAvatar = photos.filter((photo) => photo.isAvatar === false);
      return avatar ? [avatar, ...noAvatar] : noAvatar;
    })
  )
  .subscribe((photos) => {
    user.photos = photos;
    user$.next(user);
  });
