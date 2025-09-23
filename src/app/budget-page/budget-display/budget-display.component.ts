import { AfterViewInit, Component } from '@angular/core';
import { UserStoreService } from '../../../services/user-store/user-store.service';
import { CommonModule } from '@angular/common';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CustomFormModule } from '../../form-module';
import { BehaviorSubject, Observable, pairwise, take, tap } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';
import { BudgetApiService } from '../../../services/budget-api/budget-api.service';
import { Budget } from '../../../data/budget';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'budget-display',
  imports: [CommonModule, BudgetFormComponent, CustomFormModule],
  templateUrl: './budget-display.component.html',
  styleUrl: './budget-display.component.scss',
  animations: [
    trigger('inOutAnimation', [
      transition('noAnim => in', []), // No animation on first load
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.25s ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class BudgetDisplayComponent {
  public editBudgetIndex: BehaviorSubject<string> = new BehaviorSubject<string>(
    '-1'
  );

  displayedColumns: string[] = [
    'name',
    'isSavings',
    'percentage',
    'currentTotal',
    'buttons',
  ];
  dataSource = new MatTableDataSource<any>();
  BudgetForm: FormGroup;
  inputMax: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public budgets!: Array<Budget> | undefined;

  constructor(
    public userStore: UserStoreService,
    public budgetService: BudgetApiService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    this.BudgetForm = this.fb.group({});

    this.editBudgetIndex.subscribe((index) => {
      let max = 100;
      this.budgets?.forEach((budget, i) => {
        if (Number(index) !== i) {
          max -= budget.percentage;
        }
      });

      if (max !== 0) {
        this.inputMax.next(max);
      }
    });

    this.userStore.user$.pipe(take(1)).subscribe((value) => {
      this.budgets = value?.budgets;

      this.BudgetForm = this.fb.group({
        BudgetRows: this.fb.array(
          value?.budgets.map((budget, index) =>
            this.fb.group({
              name: new FormControl(budget.name),
              isSavings: new FormControl(budget.isSavings),
              percentage: new FormControl(budget.percentage),
              currentTotal: new FormControl(budget.currentTotal),
              index: index.toString(),
              id: budget.id,
            })
          ) ?? []
        ),
      });
      this.dataSource = new MatTableDataSource(
        (this.BudgetForm.get('BudgetRows') as FormArray).controls
      );

      this.editBudgetIndex
        .pipe(
          pairwise(),
          tap(([prev, cur]) => {
            if (prev !== '-1') {
              var budgetControl = (
                this.BudgetForm.get('BudgetRows') as FormArray
              ).controls.at(Number(prev));

              budgetControl?.disable();
            }
            if (cur !== '-1') {
              (this.BudgetForm.get('BudgetRows') as FormArray).controls
                .at(Number(cur))
                ?.enable();
            }
          })
        )
        .subscribe();

      this.BudgetForm.get('BudgetRows')?.disable();
    });
  }

  ngOnInit() {}

  public saveBudget(budget: any) {
    if (this.BudgetForm.status === 'INVALID') {
      this.snackbar.open(
        'Unable to save budget, please correct errors',
        'close',
        { duration: 5000 }
      );
      return;
    }

    const request = {
      id: budget.id,
      name: budget.name,
      isSavings: budget.isSavings,
      percentage: budget.percentage,
    };
    this.budgetService.UpdateUserBudget(request);

    if (this.budgets) {
      this.budgets[Number(this.editBudgetIndex.value)].percentage =
        budget.percentage;
    }
    this.toggleEdit('-1');
  }

  public toggleEdit(budgetIndex: string): void {
    this.editBudgetIndex.next(budgetIndex);
  }
}
