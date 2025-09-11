import { Component } from '@angular/core';
import { UserStoreService } from '../../../services/user-store/user-store.service';
import { CommonModule } from '@angular/common';
import { BudgetFormComponent } from '../budget-form/budget-form.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CustomFormModule } from '../../form-module';
import { BehaviorSubject, pairwise, tap } from 'rxjs';

@Component({
  selector: 'budget-display',
  imports: [CommonModule, BudgetFormComponent, CustomFormModule],
  templateUrl: './budget-display.component.html',
  styleUrl: './budget-display.component.scss'
})
export class BudgetDisplayComponent {
  public editBudgetIndex: BehaviorSubject<string> = new BehaviorSubject<string>("-1");

  displayedColumns: string[] = ['name', 'isSavings', 'percentage', 'currentTotal', 'buttons']
  dataSource = new MatTableDataSource<any>();
  BudgetForm: FormGroup;
  

  constructor(public userStore: UserStoreService, private fb: FormBuilder) {
    this.BudgetForm = this.fb.group({})

    this.userStore.user$.subscribe((value) => {
      this.BudgetForm = this.fb.group({
      BudgetRows: this.fb.array(value?.budgets.map((budget, index) => this.fb.group({
        name: new FormControl(budget.name),
        isSavings: new FormControl(budget.isSavings),
        percentage: new FormControl(budget.percentage),
        currentTotal: new FormControl(budget.currentTotal),
        index: index.toString(),
        })) ?? [])
      })
      console.log(value?.budgets)
      this.dataSource = new MatTableDataSource((this.BudgetForm.get('BudgetRows') as FormArray).controls)

      this.editBudgetIndex.pipe(pairwise(),tap(([prev, cur]) => {
        if(prev !== "-1") {
          (this.BudgetForm.get('BudgetRows') as FormArray).controls.at(Number(prev))?.disable()
        }
        if(cur !== '-1') {
          (this.BudgetForm.get('BudgetRows') as FormArray).controls.at(Number(cur))?.enable()
        }
      })).subscribe();

      this.BudgetForm.get('BudgetRows')?.disable()
    })
  }


  ngOnInit() {
    
  }

  public toggleEdit(budgetIndex: string): void {
    console.dir(budgetIndex)
    this.editBudgetIndex.next(budgetIndex);
  }
}
