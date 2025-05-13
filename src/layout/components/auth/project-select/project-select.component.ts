import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../models/project';
import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { FormsModule } from '@angular/forms';
import {LayoutService} from "../../../../shared/layout/layout.service";

@Component({
  selector: 'app-project-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-select.component.html',
  styleUrl: './project-select.component.css',
})
export class ProjectSelectComponent implements OnInit {
  @Output() projectSelected = new EventEmitter<Project>();

  allProjects: Project[] = [];
  selectedProjectId = '';

  constructor(private firebaseService: FirebaseService , private layoutService:LayoutService) {}

  async ngOnInit() {
    this.allProjects = await this.firebaseService.getDocuments('project-list');

    if (this.allProjects.length > 0) {
      this.selectedProjectId = this.allProjects[0].projectId;
      this.emitSelectedProject();
    }
  }

  onProjectChange() {
    this.emitSelectedProject();
  }

  private emitSelectedProject() {
    const selected = this.allProjects.find(p => p.projectId === this.selectedProjectId);
    if (selected) {
      this.projectSelected.emit(selected);
    }
  }
}
