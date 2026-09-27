import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLayoutComponent } from './app-layout';

describe('AppLayoutComponent', () => {
  let component: AppLayoutComponent;
  let fixture: ComponentFixture<AppLayoutComponent>;

  // Test setup
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayoutComponent],
    })
      .overrideComponent(AppLayoutComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppLayoutComponent);

    component = fixture.componentInstance;
  });

  // Test cases
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
