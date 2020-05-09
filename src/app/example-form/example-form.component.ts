import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';

// For Select Box
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

  // For Radio Buttons
  favoriteFruit: string;
  fruits: string[] = ['Apple', 'Orange', 'Banana', 'Strawberry', 'Watermelon'];

  // For Checkboxes
  checked = false;
  disabled = false;

  // For Select Box
  selectedCar: string;
  cars: Car[] = [
    {value: 'bmw', viewValue: 'BMW'},
    {value: 'vw', viewValue: 'Volkswagen'},
    {value: 'mercedes', viewValue: 'Mercedes Benz'},
  ]

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.exampleForm = this.formBuilder.group({
      name: '',
      message: 'test default message',
      phones: this.formBuilder.array([])
    });
  }

  get phoneForms(){
    return this.exampleForm.get('phones') as FormArray;
  }

  getPhonePrefix(i){
    return this.phoneForms.at(i).get('prefix');
  }

  getPhoneNumber(i){
    return this.phoneForms.at(i).get('number');
  }

  addPhone(){
    const phone = this.formBuilder.group({
      prefix:['', [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
      ]],
      number:['', [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
      ]],
    })

    this.phoneForms.push(phone);
  }

  deletePhone(i){
    this.phoneForms.removeAt(i);
  }
}
