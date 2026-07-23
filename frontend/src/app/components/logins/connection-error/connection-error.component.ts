import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ConnectionId, ConnectionStatusService } from '@services/connection-status.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'myanili-connection-error',
  templateUrl: './connection-error.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ConnectionErrorComponent {
  error$: Observable<string | undefined> = of(undefined);

  @Input() set service(service: ConnectionId) {
    this.error$ = this.connection.error$(service);
  }

  constructor(private connection: ConnectionStatusService) {}
}
