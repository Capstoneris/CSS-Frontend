import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatRadioButton} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSlider} from '@angular/material/slider';
import {MatSelect} from '@angular/material/select';
import {WebsocketService} from '@app/_services/websocket.service';

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
export class ExampleFormComponent implements OnInit, AfterViewInit {
  exampleForm: FormGroup;

  @ViewChildren('synchronizedField')
  synchronizedFields: QueryList<any>;

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

  constructor(private formBuilder: FormBuilder, private websocketService: WebsocketService) {
  }

  ngOnInit(): void {
    this.exampleForm = this.formBuilder.group({
      favouriteCity: '',
      favouriteFruit: null,
      favouriteCar: null,
      imFeelingHappy: false,
      happiness: 50
    });

    // this.exampleForm.valueChanges.subscribe(x => console.log(x));
  }

  ngAfterViewInit(): void {
    for (const field of this.synchronizedFields) {
      this.linkField(field);
    }
  }

  // The stuff below is quite hacky and ugly, but it works, so ...
  // That's what happens if one makes a C# developer write Angular code :D

  // TODO: Somehow use bindings instead?

  linkField(field: any): void {
    if (field instanceof ElementRef && field.nativeElement instanceof HTMLInputElement) {
      const input: HTMLInputElement = field.nativeElement;
      const fieldId = input.getAttribute('formControlName');
      let prevValue = input.value;
      input.addEventListener('mouseup', e => {
        this.websocketService.sendInputfieldInteraction(fieldId, null, null, input.selectionStart, input.selectionEnd);
      });
      input.addEventListener('keyup', e => {
        const newValue = input.value;
        if (newValue !== prevValue) {
          this.websocketService.sendInputfieldInteraction(fieldId, prevValue, newValue, input.selectionStart, input.selectionEnd);
          prevValue = newValue;
        }
      });
    } else if (field instanceof MatRadioButton) {
      // TODO
    } else if (field instanceof MatSelect) {
      // TODO
    } else if (field instanceof MatCheckbox) {
      // TODO
    } else if (field instanceof MatSlider) {
      // TODO
    } else {
      console.log('Unsupported field:');
      console.log(field);
    }
  }
}
