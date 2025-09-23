import { Injectable } from '@angular/core';
import { BudgetRequest } from '../../data/requests/Adds/BudgetRequest';
import { HttpClient } from '@angular/common/http';
import { UserStoreService } from '../user-store/user-store.service';
import { UpdateBudgetReqeust } from '../../data/requests/Updates/UpdateBudgetRequest';
import { Observable, shareReplay } from 'rxjs';
import { AiBudgetRequest } from '../../data/Ai/ai-budget-request';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { User } from '../../data/user';
import { Budget } from '../../data/budget';

@Injectable({
  providedIn: 'root',
})
export class BudgetApiService {
  constructor(
    private httpClient: HttpClient,
    private userStore: UserStoreService,
    private snackBar: MatSnackBar
  ) {}

  public CreateUserBudget(budgetRequest: BudgetRequest) {
    this.httpClient
      .post(`${environment.apiUrl}/secured/budget/createBudget`, budgetRequest)
      .subscribe({
        next: (response) => {
          this.userStore.refreshUser();
          console.log('Budget created', response);
        },
        error: (err) => {
          console.error('Error creating budget', err);
        },
      });
  }

  public DeleteUserBudget(budgetId: number) {
    this.httpClient
      .delete(`${environment.apiUrl}/secured/budget/deleteBudget/${budgetId}`)
      .subscribe({
        next: (response) => {
          this.userStore.refreshUser();
          console.log('Budget deleted', response);
        },
        error: (err) => {
          console.error('Error deleting budget', err);
        },
      });
  }

  public UpdateUserBudget(updateBudget: UpdateBudgetReqeust) {
    this.httpClient
      .patch(`${environment.apiUrl}/secured/budget/updateBudget`, updateBudget)
      .subscribe({
        next: (response) => {
          console.log('Budget updated', response);
          const currentUser = this.userStore.currentUser;
          if (currentUser) {
            currentUser.budgets = currentUser.budgets.map((budget) => {
              if (budget.id === updateBudget.id) {
                return {
                  currentTotal: budget.currentTotal,
                  id: budget.id,
                  isSavings: updateBudget.isSavings,
                  name: updateBudget.name,
                  percentage: updateBudget.percentage,
                } as Budget;
              } else {
                return budget;
              }
            });
            this.userStore.updateUser(currentUser);
          }
        },
        error: (err) => {
          console.error('Error updating budget', err);
        },
      });
  }

  public GetAiBudgetRequestObservable(
    userConcerns: string
  ): Observable<AiBudgetRequest> {
    return this.httpClient
      .post<AiBudgetRequest>(
        `${environment.apiUrl}/secured/budget/aibudgetrequest`,
        { userConcerns }
      )
      .pipe(shareReplay());
  }

  public AcceptAiResponse(aiResponse: AiBudgetRequest) {
    var aiAcceptanceResponse = this.httpClient
      .post(`${environment.apiUrl}/secured/budget/acceptaibudget`, aiResponse)
      .pipe(shareReplay());
    aiAcceptanceResponse.subscribe({
      next: (value) => {
        this.snackBar.open('Success!', 'close');
        this.userStore.refreshUser();
      },
      error: (err) => {
        this.snackBar.open(
          'Error, unable to handle ai budget, please try again later'
        );
      },
    });
    return aiAcceptanceResponse;
  }
}
