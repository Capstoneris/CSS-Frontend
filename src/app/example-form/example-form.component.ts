import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatRadioButton} from '@angular/material/radio';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSlider} from '@angular/material/slider';
import {MatSelect} from '@angular/material/select';
import {WebsocketService} from '@app/_services/websocket.service';
import {debounceTime, pairwise, startWith} from 'rxjs/operators';
import {InputfieldSelection, InputfieldState, User} from '@app/_models';
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

const TYPING_INDICATOR_RESET_TIMEOUT = 2000;

@Component({
  templateUrl: './example-form.component.html',
  styleUrls: ['./example-form.component.scss']
})
export class ExampleFormComponent implements OnInit, AfterViewInit {
  exampleForm: FormGroup;

  chatForm: FormGroup;

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

  fieldSelections: Map<string, InputfieldSelection[]> = new Map<string, InputfieldSelection[]>();
  fieldTypingIndicators: Map<string, FieldTypingIndicator> = new Map<string, FieldTypingIndicator>();

  private fieldLinks: Map<string, HTMLElement> = new Map<string, HTMLElement>();

  // When handling a local change, this overrides the previous field value in case it originated from a foreign edit.
  private fieldPrevOverrides: Map<string, any> = new Map<string, any>();

  constructor(private formBuilder: FormBuilder, public websocketService: WebsocketService,
              public authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.exampleForm = this.formBuilder.group({
      favouriteCity: '',
      favouriteFruit: '',
      favouriteCar: null,
      imFeelingHappy: false,
      happiness: 50
    });

    this.chatForm = this.formBuilder.group({
      message: ''
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

      let prevValue;
      if (this.fieldPrevOverrides.has(fieldId)) {
        prevValue = this.fieldPrevOverrides.get(fieldId);
        this.fieldPrevOverrides.delete(fieldId);
      } else {
        prevValue = prev[fieldId];
      }

      const nextValue = next[fieldId];

      // Value changed?
      if (prevValue === nextValue) {
        continue;
      }

      // Clear typing indicator when the user is typing itself
      if (this.fieldTypingIndicators.has(fieldId)) {
        window.clearTimeout(this.fieldTypingIndicators.get(fieldId).resetTimeout);
        this.fieldTypingIndicators.delete(fieldId);
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

    // Set field selection
    this.fieldSelections.set(fieldId, state.selections);

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

    // Clear previous typing indicator
    if (this.fieldTypingIndicators.has(fieldId)) {
      window.clearTimeout(this.fieldTypingIndicators.get(fieldId).resetTimeout);
    }

    // Set new typing indicator
    const fieldTypingIndicator = {
      typingUser: byUser, resetTimeout: window.setTimeout(() => {
        this.fieldTypingIndicators.delete(fieldId);
      }, TYPING_INDICATOR_RESET_TIMEOUT)
    };
    this.fieldTypingIndicators.set(fieldId, fieldTypingIndicator);


    // Apply new field state
    this.exampleForm.patchValue({
      [fieldId]: value
    }, {emitEvent: false});

    // Remember this as foreign previous value
    this.fieldPrevOverrides.set(fieldId, value);
  }

  addEmoji($event) {
    const messageField = this.chatForm.get('message');
    messageField.patchValue((messageField.value || '') + $event.emoji.native);
  }

  sendChatMessage() {
    const message = this.chatForm.value.message;
    if (!message)
      return;
    this.websocketService.sendChatMessage(this.authenticationService.currentUserValue, message);
    this.chatForm.reset();
  }

  // The stuff below is quite hacky and ugly, but it works, so ...
  // This is what happens if one makes a C# developer write Angular code :P
  linkField(field: any): void {
    let fieldId: string;
    let element: HTMLElement;

    if (field instanceof ElementRef && field.nativeElement instanceof HTMLInputElement) {
      element = field.nativeElement;
      fieldId = element.getAttribute('formControlName');
      element.addEventListener('mouseup', e => {
        /* tslint:disable:no-string-literal */
        this.websocketService.sendInputfieldInteraction(fieldId, false, null, null, element['selectionStart'], element['selectionEnd']);
        /* tslint:enable:no-string-literal */
      });
    } else if (field instanceof MatRadioButton) {
      return; // Not needed yet
    } else if (field instanceof MatSelect) {
      return; // Not needed yet
    } else if (field instanceof MatCheckbox) {
      return; // Not needed yet
    } else if (field instanceof MatSlider) {
      return; // Not needed yet
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

    return color + '70';
  }

  getFormFieldHint(fieldId: string) {
    if (!this.fieldSelections.has(fieldId))
      return null;

    const selections = this.fieldSelections.get(fieldId);
    if (!selections || !selections.length)
      return null;

    const ownUserName = this.authenticationService.currentUserValue.username;

    const usernames = selections.map(s => s.user.username).filter(u => ownUserName !== u);
    if (!usernames.length)
      return null;

    let hint = 'Selected by ';
    if (usernames.length === 1) {
      hint += usernames[0];
    } else {
      hint += `${usernames.slice(0, -1).join(', ')} and ${usernames[usernames.length - 1]}`;
    }
    hint += '.';


    if (this.fieldTypingIndicators.has(fieldId) && this.fieldTypingIndicators.get(fieldId).typingUser.username !== ownUserName)
      hint += ` ${this.fieldTypingIndicators.get(fieldId).typingUser.username} is typing...`;

    return hint;
  }
}
