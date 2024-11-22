import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-dialog-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.css',
})
export class DialogBoxComponent implements AfterViewInit {
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() header: string = '';
  @Input() message: string = '';
  @Input() isModalOpen: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' | string = 'medium';
  @Input() closeOnOverlayClick: boolean = true;
  @Input() type: 'info' | 'warning' | 'error' | 'success' | string = 'warning';

  @ViewChild('modalPanel') modalPanel!: ElementRef;

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private offsetX = 0;
  private offsetY = 0;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    const modalHeader =
      this.modalPanel.nativeElement.querySelector('.modal-header');

    this.renderer.listen(modalHeader, 'mousedown', (event: MouseEvent) =>
      this.startDrag(event)
    );
    this.renderer.listen('window', 'mousemove', (event: MouseEvent) =>
      this.onDrag(event)
    );
    this.renderer.listen('window', 'mouseup', () => this.stopDrag());
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.offsetX;
    this.startY = event.clientY - this.offsetY;
    this.renderer.setStyle(document.body, 'user-select', 'none'); // Disable text selection
    this.renderer.setStyle(this.modalPanel.nativeElement, 'transition', 'none');  
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;

    event.preventDefault();

    this.offsetX = event.clientX - this.startX;
    this.offsetY = event.clientY - this.startY;

    this.renderer.setStyle(
      this.modalPanel.nativeElement,
      'transform',
      `translate(${this.offsetX}px, ${this.offsetY}px)`
    );
  }

  stopDrag() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.renderer.setStyle(document.body, 'user-select', ''); 
    this.renderer.setStyle(
      this.modalPanel.nativeElement,
      'transition',
      'transform 0.3s ease'
    );  
  }

  onYes() {
    this.confirm.emit(true);
  }

  onNo() {
    this.confirm.emit(false);
  }

  onBackdropClick() {
    if (this.closeOnOverlayClick) {
      this.confirm.emit(false);
      this.isModalOpen = false;
    }
  }
}
