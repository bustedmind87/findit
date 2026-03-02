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
        // Map backend items to component format
        this.qaItems = (Array.isArray(items) ? items : (items?.content || []))
          .map((item: any) => ({
            ...item,
            isOpen: false
          }));
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

  private useDefaultQA() {
    this.qaItems = [
      {
        question: 'How do I report a found item?',
        answer: 'To report a found item, click on "Report Found" in the navigation menu. Fill in the item details including title, description, category, location, date found, and upload at least one clear photo. Submit the form and an admin will review it for approval.',
        isOpen: false
      },
      {
        question: 'What should I include in a lost item report?',
        answer: 'When reporting a lost item, include as much detail as possible: the item\'s color, brand, condition, any unique markings or identifying features, where you last saw it, and approximately when you lost it. The more details you provide, the better our chances of finding it.',
        isOpen: false
      },
      {
        question: 'How do I claim an item I found?',
        answer: 'If you found an item listed on FindIt, click "View Details" on the item card, then click "Claim this item". Fill in your information and provide proof of ownership. Describe what makes this item yours (serial numbers, unique markings, condition, etc.) to help admins verify your claim.',
        isOpen: false
      },
      {
        question: 'How long are items kept in FindIt?',
        answer: 'Items in FindIt are kept for up to 30 days. If an item is not claimed within this period, it will be removed from the system. We recommend checking regularly or reporting your lost item to increase the chances of finding it quickly.',
        isOpen: false
      },
      {
        question: 'Who has access to my contact information?',
        answer: 'Contact information is confidential and only visible to administrators. Your phone number or email is never shared publicly. Only admins can use it to contact you regarding your lost item or claim.',
        isOpen: false
      },
      {
        question: 'What if I need to update or delete my report?',
        answer: 'Currently, you can\'t edit or delete reports through the app. If you need to make changes, please contact the school\'s Lost & Found office directly or email the FindIt administrator. They can help you update or remove your report.',
        isOpen: false
      },
      {
        question: 'Can I search for specific items?',
        answer: 'Yes! Use the search bar on the home page to find items by keyword, category, or location. You can also filter by category (Apparel, Technology, Food Containers, etc.) and location (Cafeteria, Library, Playground, etc.).',
        isOpen: false
      },
      {
        question: 'What if someone claims my lost item?',
        answer: 'If someone submits a claim for an item you reported lost, admins will review their claim. They may contact you to verify the claimer\'s proof of ownership. If approved, you\'ll be notified and can arrange pickup.',
        isOpen: false
      },
      {
        question: 'What happens after I submit a claim?',
        answer: 'After submitting a claim, an admin will review your proof of ownership. If your claim is verified, you\'ll be contacted with instructions on how to pick up the item. The process typically takes 1-2 business days.',
        isOpen: false
      },
      {
        question: 'Is there a mobile version of this app?',
        answer: 'FindIt is fully responsive and works on all devices including smartphones, tablets, and desktop computers. You can access it from any device with a web browser.',
        isOpen: false
      }
    ];
  }

  toggleQA(item: QAItem): void {
    item.isOpen = !item.isOpen;
  }
}
