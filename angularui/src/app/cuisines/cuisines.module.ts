import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CuisinesRoutingModule } from './cuisines-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuisinesComponent } from './cuisines/cuisines.component';
import { CuisineItemComponent } from './cuisines/cuisine-item/cuisine-item.component';



@NgModule({
  declarations: [
    CuisinesComponent,
    CuisineItemComponent
  ],
  imports: [
    CommonModule,
    CuisinesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class CuisinesModule { }
