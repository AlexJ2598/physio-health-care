import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  LoadingComponent
} from './loading';

describe('LoadingComponent', () => {

  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        LoadingComponent
      ]
    })
      .overrideComponent(
        LoadingComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      LoadingComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.message).toBe('');
    expect(component.size).toBe('medium');
    expect(component.fullPage).toBeFalsy();
    expect(component.inline).toBeFalsy();
  });

  it('should accept a custom message', () => {
    component.message = 'Loading patients...';

    expect(component.message).toBe(
      'Loading patients...'
    );
  });

  it('should accept different sizes', () => {
    component.size = 'small';

    expect(component.size).toBe('small');

    component.size = 'large';

    expect(component.size).toBe('large');
  });

  it('should support full page mode', () => {
    component.fullPage = true;

    expect(component.fullPage).toBeTruthy();
  });

  it('should support inline mode', () => {
    component.inline = true;

    expect(component.inline).toBeTruthy();
  });

});