import { TestBed } from '@angular/core/testing';

import { HttpApi } from './http-api';

describe('HttpApi', () => {
  let service: HttpApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
