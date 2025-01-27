import { Component, OnInit, Input } from '@angular/core';
import { ActiveOrderService } from '../../../services/active-order.service';


@Component({
  selector: 'app-active-order-header',
  templateUrl: './active-order-header.component.html',
  styleUrls: ['./active-order-header.component.css']
})
export class ActiveOrderHeaderComponent implements OnInit {
  @Input() userName: string;
  @Input() orderId: string;
  constructor(
    private activeOrderService: ActiveOrderService
  ) { }

  ngOnInit() {

  }
}

