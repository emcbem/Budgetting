import { Injectable } from '@angular/core';
import { UserApiService } from '../user-api/user-api.service';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../data/user';
import { switchMap, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private userApi: UserApiService, private auth: AuthService) {
    this.refreshUser();
  }

  updateUser(user: User): void {
    this.userSubject.next(user);
  }

  refreshUser() {
    this.auth.user$
      .pipe(
        filter((user) => !!user), // wait until auth emits a user
        switchMap(() => this.userApi.getUser())
      )
      .subscribe((u) => this.userSubject.next(u));
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}
