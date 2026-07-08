import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MalService } from '@services/mal.service';
import { filter, firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const malService = inject(MalService);
  const router = inject(Router);
  const loggedIn = await firstValueFrom(
    malService.loggedIn.pipe(filter(v => v !== '***loading***')),
  );
  if (loggedIn) return true;
  return router.createUrlTree(['/search/anime']);
};
