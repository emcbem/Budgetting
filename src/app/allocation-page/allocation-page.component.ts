import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AllocationApiService } from '../../services/allocation-api/allocation-api.service';
import { UserStoreService } from '../../services/user-store/user-store.service';
import { User } from '../../data/user';

@Component({
  selector: 'allocation-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './allocation-page.component.html',
  styleUrl: './allocation-page.component.scss'
})
export class AllocationPageComponent implements OnInit {
  totalPay: number = 0
  private user: User | null = null;

  constructor(private allocationService: AllocationApiService, private userStore: UserStoreService) {}

  public ngOnInit(): void {
    this.userStore.user$.subscribe((user) => {
      this.user = user;
    })
  }

  public get amountToSavings(): number {
    if (!this.user || !this.user.budgets) {
      return 0;
    }
    return this.totalPay * this.user.budgets
      .map((budget) => budget.isSavings ? budget.percentage * 0.01 : 0)
      .reduce((prev, cur) => prev + cur, 0);
  }

  public SubmitPay()
  {
    console.log(this.totalPay)
    this.allocationService.SubmitPay(this.totalPay)
  }
}
