import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

interface Fruit {
  value: string;
  viewValue: string;
}

interface Car {
  value: string;
  viewValue: string;
}

@Component({
  templateUrl: './example-form.component.html',
  styleUrls: ['./example-form.component.scss']
})
export class ExampleFormComponent implements OnInit {
  exampleForm: FormGroup;

  fruitChoices: Fruit[] = [
    {value: 'apple', viewValue: 'Apple'},
    {value: 'orange', viewValue: 'Orange'},
    {value: 'banana', viewValue: 'Banana'},
    {value: 'strawberry', viewValue: 'Strawberry'},
    {value: 'watermelon', viewValue: 'Watermelon'}
  ];

  carChoices: Car[] = [
    {value: 'bmw', viewValue: 'BMW'},
    {value: 'vw', viewValue: 'Volkswagen'},
    {value: 'mercedes', viewValue: 'Mercedes Benz'},
  ];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.exampleForm = this.formBuilder.group({
      favouriteCity: '',
      favouriteFruit: null,
      favouriteCar: null,
      imFeelingHappy: false,
      happiness: 50
    });

    this.exampleForm.valueChanges.subscribe(x => console.log(x));
  }
}
