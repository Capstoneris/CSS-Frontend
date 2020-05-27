import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatRadioButton} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSlider} from '@angular/material/slider';
import {MatSelect} from '@angular/material/select';
import {WebsocketService} from '@app/_services/websocket.service';
import {debounceTime, pairwise, startWith} from 'rxjs/operators';
import {InputfieldState, User} from '@app/_models';
import {AuthenticationService} from '@app/_services';

interface Fruit {
  value: string;
  viewValue: string;
}

interface Car {
  value: string;
  viewValue: string;
}

interface FieldTypingIndicator {
  typingUser: User;
  resetTimeout: any;
}

const TYPING_INDICATOR_RESET_TIMEOUT = 5000;

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

  fieldTypingIndicators: Map<string, FieldTypingIndicator> = new Map<string, FieldTypingIndicator>();

  private fieldLinks: Map<string, HTMLElement> = new Map<string, HTMLElement>();

  constructor(private formBuilder: FormBuilder, public websocketService: WebsocketService,
              public authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.exampleForm = this.formBuilder.group({
      favouriteCity: '',
      favouriteFruit: '',
      favouriteCar: '',
      imFeelingHappy: false,
      happiness: 50
    });

    // Typed the startWith value to not implicitly use deprecated signature: https://github.com/ReactiveX/rxjs/issues/4772
    this.exampleForm.valueChanges.pipe(debounceTime(100), startWith(this.exampleForm.value as object), pairwise())
      .subscribe(([prev, next]) => this.handleChanges(prev, next));
  }

  ngAfterViewInit(): void {
    // Used to gain direct access to the HTML elements
    for (const field of this.synchronizedFields) {
      this.linkField(field);
    }

    this.websocketService.listenForInputfieldChanges().subscribe(({user, state}) => this.applyChanges(user, state));
  }

  handleChanges(prev: object, next: object): void {
    for (const fieldId in prev) {
      if (!prev.hasOwnProperty(fieldId) || !next.hasOwnProperty(fieldId)) {
        continue;
      }

      const prevValue = prev[fieldId];
      const nextValue = next[fieldId];

      // Value changed?
      if (prevValue === nextValue) {
        continue;
      }

      // Get current selection, if supported
      let selectionStart = 0;
      let selectionEnd = 0;
      if (this.fieldLinks.has(fieldId)) {
        const field = this.fieldLinks.get(fieldId);
        if (field instanceof HTMLInputElement) {
          const inputField = field as HTMLInputElement;
          selectionStart = inputField.selectionStart;
          selectionEnd = inputField.selectionEnd;
        }
      }

      // Send change notification
      this.websocketService.sendInputfieldInteraction(fieldId, true, prevValue?.toString(),
        nextValue?.toString(), selectionStart, selectionEnd);
    }
  }

  applyChanges(byUser: User, state: InputfieldState) {
    const fieldId = state.fieldId;

    // Clear previous field selection
    if (this.fieldTypingIndicators.has(fieldId)) {
      window.clearTimeout(this.fieldTypingIndicators.get(fieldId).resetTimeout);
    }

    // Set new field selection
    const fieldTypingIndicator = {
      typingUser: byUser, resetTimeout: window.setTimeout(() => {
        this.fieldTypingIndicators.delete(fieldId);
        console.log(this.fieldTypingIndicators);
      }, TYPING_INDICATOR_RESET_TIMEOUT)
    };
    this.fieldTypingIndicators.set(fieldId, fieldTypingIndicator);

    // Analyze field value type
    const fieldType = typeof this.exampleForm.value[fieldId];

    // Convert value if necessary
    let value: any = state.value;
    if (fieldType === 'boolean') {
      value = (value === 'true');
    } else if (fieldType === 'number') {
      value = parseInt(value, 10);
    } else if (fieldType !== 'string') {
      console.error(`Cannot convert received value to field type ${fieldType}.`);
      return;
    }

    // Check if the value is different from the displayed one
    // Compare to value of form control directly to mitigate race conditions: https://stackoverflow.com/a/44898740/5495384
    if (this.exampleForm.controls[fieldId].value === value) {
      return;
    }

    // Apply new field state
    this.exampleForm.patchValue({
      [fieldId]: value
    }, {emitEvent: false});
  }

  // The stuff below is quite hacky and ugly, but it works, so ...
  // This is what happens if one makes a C# developer write Angular code :P
  linkField(field: any): void {
    let fieldId: string;
    let element: HTMLElement;

    if (field instanceof ElementRef && field.nativeElement instanceof HTMLInputElement) {
      element = field.nativeElement;
      fieldId = element.getAttribute('formControlName');
      // input.addEventListener('mouseup', e => {
      //   this.websocketService.sendInputfieldInteraction(fieldId, false, null, null, input.selectionStart, input.selectionEnd);
      // });
    } else if (field instanceof MatRadioButton) {
      return; // TODO
    } else if (field instanceof MatSelect) {
      return; // TODO
    } else if (field instanceof MatCheckbox) {
      return; // TODO
    } else if (field instanceof MatSlider) {
      return; // TODO
    } else {
      console.error('Unsupported field:');
      console.error(field);
      return;
    }
    console.assert(!!fieldId);
    console.assert(!!element);
    this.fieldLinks.set(fieldId, element);
  }

  // Generates a unique color based on the username of a giver user
  getColorForUser(user: User): string {
    // Generate color based on username
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }

    return color + '90';
  }
}
