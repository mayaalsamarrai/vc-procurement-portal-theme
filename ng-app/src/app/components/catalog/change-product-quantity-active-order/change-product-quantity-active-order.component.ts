import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ICart, ILineItem } from 'src/app/models/dto/icart';
import { Subject, Subscription, EMPTY } from 'rxjs';
import { ActiveOrderService } from 'src/app/services/active-order.service';
import { ConfirmService } from 'src/app/modules/confirm-modal/confirm-modal-service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-change-product-quantity-active-order',
  templateUrl: './change-product-quantity-active-order.component.html',
  styleUrls: ['./change-product-quantity-active-order.component.scss']
})
export class ChangeProductQuantityActiveOrderComponent implements OnInit, OnDestroy {

  @Input()
  cart: ICart;
  @Input()
  lineItem: ILineItem;

  productQuantity$ = new Subject<number>();
  private quantitySub: Subscription;

  constructor(private readonly activeOrderService: ActiveOrderService, private confirmService: ConfirmService) {
   }

  ngOnInit() {
    this.quantitySub = this.productQuantity$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(quantity => {
        console.log('New quantity: ', quantity);
        this.updateLineItemQuantity(+quantity);
        return EMPTY;
      })
    ).subscribe();
  }

  removeItem(item: ILineItem) {
    const confirmOptions = { title: 'Line item removing', message: 'Are you sure you want to remove this line item from the active order?' };
    this.confirmService.confirm(confirmOptions).then(() => this.activeOrderService.removeItem(item.id).subscribe() );
  }

  decrementQuantity(lineItem: ILineItem) {
    if (lineItem.quantity <= 1) {
      this.removeItem(lineItem);
      return;
    }
    lineItem.quantity--;
    this.activeOrderService.changeItemQuantity(lineItem.id, lineItem.quantity).subscribe();
  }

  incrementQuantity(lineItem: ILineItem) {
    lineItem.quantity++;
    this.activeOrderService.changeItemQuantity(lineItem.id, lineItem.quantity).subscribe();
  }

  onChangeQuantity(quantity: number) {
    this.productQuantity$.next(quantity);
  }

  updateLineItemQuantity(quantity: number) {
    const item = this.lineItem;
    this.activeOrderService.changeItemQuantity(item.id, quantity).subscribe();
  }

  ngOnDestroy(): void {
    if (this.quantitySub) {
      this.quantitySub.unsubscribe();
      this.quantitySub = null;
    }

  }


}
