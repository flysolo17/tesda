import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { AppComponent } from '../app.component';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor() {}

  async confirmed(appointment: Appointment) {
    const templateParams = {
      status: AppointmentStatus.CONFIRMED,
      statusColor: '#458500',
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.personalInformation.name,
      message:
        'Your appointment has been confirmed. Please find the details below:',
      purpose: appointment.serviceInformation.name,
      email: appointment.personalInformation.email,
      notes: appointment.notes,
    };

    await emailjs.send('service_06zldcb', 'template_ukxipdh', templateParams, {
      publicKey: 'izSGyLd2KtohkatAI',
    });
  }

  async reject(appointment: Appointment) {
    const templateParams = {
      status: AppointmentStatus.REJECTED,
      statusColor: '#d9534f',
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.personalInformation.name,
      message:
        'We regret to inform you that your appointment has been rejected. Please contact us for further assistance.',
      purpose: appointment.serviceInformation.name,
      email: appointment.personalInformation.email,
      notes: appointment.notes,
    };

    await emailjs.send('service_06zldcb', 'template_ukxipdh', templateParams, {
      publicKey: 'izSGyLd2KtohkatAI',
    });
  }
  async cancelled(appointment: Appointment) {
    const templateParams = {
      status: AppointmentStatus.CANCELLED,
      statusColor: '#ffc107',
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.personalInformation.name,
      message:
        'Your appointment has been cancelled. If this was a mistake or you wish to reschedule, please contact us.',
      purpose: appointment.serviceInformation.name,
      email: appointment.personalInformation.email,
      notes: appointment.notes,
    };

    await emailjs.send('service_06zldcb', 'template_ukxipdh', templateParams, {
      publicKey: 'izSGyLd2KtohkatAI',
    });
  }

  async rescheduled(appointment: Appointment) {
    const templateParams = {
      status: AppointmentStatus.CONFIRMED,
      statusColor: '#0dcaf0',
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
      name: appointment.personalInformation.name,
      message:
        'Your appointment has been rescheduled. Please review the updated details below:',
      purpose: appointment.serviceInformation.name,
      email: appointment.personalInformation.email,
      notes: appointment.notes ?? '',
    };

    await emailjs.send('service_06zldcb', 'template_ukxipdh', templateParams, {
      publicKey: 'izSGyLd2KtohkatAI',
    });
  }
}
