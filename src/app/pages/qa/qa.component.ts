import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QAService } from '../../core/qa.service';

interface QAItem {
  id?: number;
  question: string;
  answer?: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-qa',
  templateUrl: './qa.component.html',
  styleUrls: ['./qa.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class QAComponent implements OnInit {
  qaItems: QAItem[] = [];
  loading = true;

  constructor(private qaService: QAService) {}

  ngOnInit() {
    this.loadQA();
  }

  loadQA() {
    this.qaService.list().subscribe({
      next: (items: any) => {
        const backendItems = (Array.isArray(items) ? items : (items?.content || []))
          .map((item: any) => ({
            ...item,
            isOpen: false
          }));

        if (backendItems.length >= 7) {
          this.qaItems = backendItems.slice(0, 7);
        } else {
          const defaults = this.defaultQAItems();
          const merged = [...backendItems];
          for (const fallback of defaults) {
            if (merged.length >= 7) break;
            const exists = merged.some(item => item.question === fallback.question);
            if (!exists) merged.push(fallback);
          }
          this.qaItems = merged.slice(0, 7);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load QA items', err);
        this.loading = false;
        // Use default items if backend fails
        this.useDefaultQA();
      }
    });
  }

  private defaultQAItems(): QAItem[] {
    return [
      {
        question: 'What is EBHS Lost & Found used for?',
        answer: 'EBHS Lost & Found helps students and staff report lost items, post found items, and submit claims. It centralizes updates so everyone can track item status in one place.',
        isOpen: false
      },
      {
        question: 'How do I report a found item?',
        answer: 'Go to Report Found, fill in the item details, choose category and location, select the found date, and upload at least one photo. Your submission is then sent for admin review.',
        isOpen: false
      },
      {
        question: 'How do I report a lost item?',
        answer: 'Go to Report Lost and provide a clear title, description, category, location, and lost date. Add a photo if available to improve the chance of matching your item.',
        isOpen: false
      },
      {
        question: 'When can I claim an item?',
        answer: 'You can claim only items that are approved and currently available. After submitting a claim request, it stays pending until an admin approves or rejects it.',
        isOpen: false
      },
      {
        question: 'What happens after I submit a claim?',
        answer: 'Admins review your claim details and proof of ownership. If approved, the item status updates to claimed and you can coordinate pickup through the school process.',
        isOpen: false
      },
      {
        question: 'Who can see my contact information?',
        answer: 'Contact information is not shown publicly. It is used by admins for verification and communication related to your report or claim.',
        isOpen: false
      },
      {
        question: 'Does EBHS Lost & Found work on phone and desktop?',
        answer: 'Yes. The site is responsive and works on mobile, tablet, and desktop browsers, so you can search and report items from any device.',
        isOpen: false
      }
    ];
  }

  private useDefaultQA() {
    this.qaItems = this.defaultQAItems();
  }

  toggleQA(item: QAItem): void {
    item.isOpen = !item.isOpen;
  }
}
