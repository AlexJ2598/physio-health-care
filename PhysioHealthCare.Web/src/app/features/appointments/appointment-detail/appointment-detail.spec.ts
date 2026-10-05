import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppointmentService } from '../../../core/services/appointment';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { Appointment } from '../../../shared/models/appointment';
import { AppointmentDetail } from './appointment-detail';

describe('AppointmentDetail', () => {
  let component: AppointmentDetail;
  let fixture: ComponentFixture<AppointmentDetail>;

  let getById: ReturnType<typeof vi.fn>;
  let updateNotes: ReturnType<typeof vi.fn>;
  let toastSuccess: ReturnType<typeof vi.fn>;
  let toastError: ReturnType<typeof vi.fn>;

  const appointment: Appointment = {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'Test patient',
    appointmentDate: '2026-10-02T18:00:00Z',
    reason: 'Follow-up',
    notes: null,
    status: 'Scheduled',
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    wasAutomaticallyCancelled: false,
  };

  beforeEach(async () => {
    getById = vi.fn().mockReturnValue(of(appointment));
    updateNotes = vi.fn();

    toastSuccess = vi.fn();
    toastError = vi.fn();

    await TestBed.configureTestingModule({
      imports: [AppointmentDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                id: appointment.id,
              }),
            },
          },
        },
        {
          provide: AppointmentService,
          useValue: {
            getById,
            updateNotes,
          },
        },
        {
          provide: TranslationService,
          useValue: {
            translate: (key: string) => key,
            getCurrentLanguage: () => 'en',
          },
        },
        {
          provide: ToastService,
          useValue: {
            success: toastSuccess,
            error: toastError,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetail);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(getById).toHaveBeenCalledWith(appointment.id);
    expect(component.appointment).toEqual(appointment);

    expect(
      fixture.nativeElement.querySelector('.appointment-detail-card')
        ?.textContent,
    ).toContain(appointment.patientName);
  });

  it('should initialize notesDraft with the appointment notes', () => {
    const inProgressAppointment: Appointment = {
      ...appointment,
      notes: 'Initial clinical notes',
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    getById.mockReturnValue(of(inProgressAppointment));

    component.loadAppointment(inProgressAppointment.id);

    expect(component.notesDraft).toBe('Initial clinical notes');
  });

  it('should update notes when appointment is in progress', () => {
    const inProgressAppointment: Appointment = {
      ...appointment,
      notes: 'Previous notes',
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    const updatedAppointment: Appointment = {
      ...inProgressAppointment,
      notes: 'Updated clinical notes',
    };

    component.appointment = inProgressAppointment;
    component.notesDraft = 'Updated clinical notes';

    updateNotes.mockReturnValue(of(updatedAppointment));

    component.saveNotes();

    expect(updateNotes).toHaveBeenCalledWith(
      inProgressAppointment.id,
      {
        notes: 'Updated clinical notes',
      },
    );

    expect(component.appointment).toEqual(updatedAppointment);
    expect(component.notesDraft).toBe('Updated clinical notes');
    expect(component.isSavingNotes).toBe(false);

    expect(toastSuccess).toHaveBeenCalledWith(
      'appointments.detail.notesUpdateSuccess',
    );

    expect(toastError).not.toHaveBeenCalled();
  });

  it('should allow saving empty notes while appointment is in progress', () => {
    const inProgressAppointment: Appointment = {
      ...appointment,
      notes: 'Notes to remove',
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    const updatedAppointment: Appointment = {
      ...inProgressAppointment,
      notes: '',
    };

    component.appointment = inProgressAppointment;
    component.notesDraft = '';

    updateNotes.mockReturnValue(of(updatedAppointment));

    component.saveNotes();

    expect(updateNotes).toHaveBeenCalledWith(
      inProgressAppointment.id,
      {
        notes: '',
      },
    );

    expect(component.notesDraft).toBe('');
    expect(component.appointment?.notes).toBe('');
    expect(component.isSavingNotes).toBe(false);

    expect(toastSuccess).toHaveBeenCalledWith(
      'appointments.detail.notesUpdateSuccess',
    );
  });

  it.each([
    'Scheduled',
    'Completed',
    'Cancelled',
  ] as const)(
    'should not update notes when appointment status is %s',
    (status) => {
      component.appointment = {
        ...appointment,
        status,
      };

      component.notesDraft = 'Should not be saved';

      component.saveNotes();

      expect(updateNotes).not.toHaveBeenCalled();
      expect(toastSuccess).not.toHaveBeenCalled();
      expect(toastError).not.toHaveBeenCalled();
    },
  );

  it('should not update notes when another notes update is already in progress', () => {
    component.appointment = {
      ...appointment,
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    component.notesDraft = 'Updated notes';
    component.isSavingNotes = true;

    component.saveNotes();

    expect(updateNotes).not.toHaveBeenCalled();
  });

  it('should handle an error when updating notes', () => {
    component.appointment = {
      ...appointment,
      notes: 'Previous notes',
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    component.notesDraft = 'New notes';

    updateNotes.mockReturnValue(
      throwError(() => new Error('Update failed')),
    );

    component.saveNotes();

    expect(updateNotes).toHaveBeenCalledWith(
      appointment.id,
      {
        notes: 'New notes',
      },
    );

    expect(component.isSavingNotes).toBe(false);

    expect(toastError).toHaveBeenCalledWith(
      'appointments.detail.notesUpdateError',
    );

    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('should show notes editor only when appointment is in progress', () => {
    const inProgressAppointment: Appointment = {
      ...appointment,
      notes: 'Clinical notes',
      status: 'InProgress',
      startedAt: '2026-10-02T18:05:00Z',
    };

    getById.mockReturnValue(of(inProgressAppointment));

    component.loadAppointment(inProgressAppointment.id);

    fixture.detectChanges();

    expect(component.appointment).toEqual(inProgressAppointment);
    expect(component.notesDraft).toBe('Clinical notes');

    expect(
      fixture.nativeElement.querySelector('.notes-editor'),
    ).not.toBeNull();

    expect(
      fixture.nativeElement.querySelector('.notes-textarea'),
    ).not.toBeNull();
  });

  it.each([
    'Scheduled',
    'Completed',
    'Cancelled',
  ] as const)(
    'should not show notes editor when appointment status is %s',
    (status) => {
      const readOnlyAppointment: Appointment = {
        ...appointment,
        notes: 'Read-only notes',
        status,
        startedAt:
          status === 'Completed'
            ? '2026-10-02T18:05:00Z'
            : null,
        completedAt:
          status === 'Completed'
            ? '2026-10-02T18:30:00Z'
            : null,
        cancelledAt:
          status === 'Cancelled'
            ? '2026-10-02T18:10:00Z'
            : null,
      };

      getById.mockReturnValue(of(readOnlyAppointment));

      component.loadAppointment(readOnlyAppointment.id);

      fixture.detectChanges();

      expect(component.appointment).toEqual(readOnlyAppointment);

      expect(
        fixture.nativeElement.querySelector('.notes-editor'),
      ).toBeNull();

      expect(
        fixture.nativeElement.querySelector('.notes-textarea'),
      ).toBeNull();

      expect(
        fixture.nativeElement.querySelector(
          '.appointment-detail-card',
        )?.textContent,
      ).toContain('Read-only notes');
    },
  );
});
