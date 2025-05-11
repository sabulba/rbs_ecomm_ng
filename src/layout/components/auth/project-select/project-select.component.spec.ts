import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAutoCompleteComponent } from './project-auto-complete.component';

describe('ProjectAutoCompleteComponent', () => {
  let component: ProjectAutoCompleteComponent;
  let fixture: ComponentFixture<ProjectAutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAutoCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
