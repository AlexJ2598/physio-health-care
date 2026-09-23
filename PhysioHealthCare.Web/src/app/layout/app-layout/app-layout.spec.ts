import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AppLayoutComponent
} from './app-layout';

describe('AppLayoutComponent', () => {

  let component: AppLayoutComponent;
  let fixture: ComponentFixture<AppLayoutComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        AppLayoutComponent
      ]
    })
      .overrideComponent(
        AppLayoutComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      AppLayoutComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});