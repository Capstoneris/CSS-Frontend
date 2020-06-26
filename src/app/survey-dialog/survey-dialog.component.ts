import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Survey} from '@app/_models';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-survey-dialog',
  templateUrl: './survey-dialog.component.html',
  styleUrls: ['./survey-dialog.component.scss']
})
export class SurveyDialogComponent implements OnInit {
  surveyForm: FormGroup;
  questionsFormArray: FormArray;

  constructor(
    public dialogRef: MatDialogRef<SurveyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Survey,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.surveyForm = this.formBuilder.group({
      ratingQuestions: this.questionsFormArray = this.formBuilder.array(this.data.questions.map(question => this.formBuilder.control(3))),
      additionalFeedback: null
    });
  }

  getIcon(questionId: number, index: number) {
    const rating = this.surveyForm.value.ratingQuestions[questionId];
    if (rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

  setRating(questionId: number, rating: number) {
    this.questionsFormArray.at(questionId).patchValue(rating);
  }

  onSubmitClick() {
    const value = this.surveyForm.value;

    this.dialogRef.close({
      answers: this.data.questions.map((question, index) => ({
        questionId: question.id,
        rating: value.ratingQuestions[index]
      })),
      feedback: value.additionalFeedback
    });
  }

  onNoClick() {
    this.dialogRef.close({
      answers: [],
      feedback: null
    });
  }
}
