import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { CustomFormModule } from './form-module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-013fwxix4dwe1jea.us.auth0.com',
      clientId: 'JY26bmn56wTqfL8W0HzgfGEN8IQA6CP1',
      authorizationParams: {
        redirect_uri: environment.appUrl,

        audience: 'https://dev-013fwxix4dwe1jea.us.auth0.com/api/v2/',
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: `${environment.apiUrl}/secured/*`,
          },
        ],
      },
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAnimations(),
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {subscriptSizing: 'dynamic'}}
  ],
  
};
