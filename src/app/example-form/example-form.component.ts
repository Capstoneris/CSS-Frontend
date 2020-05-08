import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';


@Component({
  templateUrl: './example-form.component.html',
  styleUrls: ['./example-form.component.scss']
})
export class ExampleFormComponent implements OnInit {
  m_form: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,
              private router: Router,) {
  }

  ngOnInit(): void {
    this.m_form = this.fb.group({
      name: '',
      message: 'test default message'
    })

    // subscribe to observable
    this.m_form.valueChanges.subscribe(console.log)
  }

}
