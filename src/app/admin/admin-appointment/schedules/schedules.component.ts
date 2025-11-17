import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './schedules.component.html',
  styleUrl: './schedules.component.scss',
})
export class SchedulesComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this),

    eventClassNames: () => ['bg-primary', 'text-white', 'border-0'],

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek',
    },

    validRange: {
      start: new Date().toISOString().split('T')[0], // disables past days
    },

    dateClick: (info) => {
      const clickedDate = new Date(info.dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (clickedDate < today) {
        // Optional: show feedback
        alert('Past dates are disabled.');
        return;
      }

      // Proceed with logic for valid future date
      console.log('Clicked date:', info.dateStr);
    },
  };

  handleEventClick(arg: any): void {
    const schedule = arg.event.extendedProps;
    alert(`Schedule at ${schedule.time} with ${schedule.slots} slots`);
  }
}
