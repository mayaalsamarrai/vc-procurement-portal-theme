import { Component, OnInit, Input } from '@angular/core';
import { ActiveOrderService } from '../../services/active-order.service';
import { Product } from '../../models/product';
import { ProductProperties } from '../../models/product-properties';
import { ProductPrice } from '../../models/product-price';
import { Category } from '../../models/category';
import { Post } from '../../models/Post';
import { User } from '../../models/user';
import { AddedProduct } from '../../models/added-product';


@Component({
  selector: 'app-active-order',
  templateUrl: './active-order.component.html',
  styleUrls: ['./active-order.component.css']
})
export class ActiveOrderComponent implements OnInit {
  @Input() categories: Category[];
  userName: string = "";
  orderId: string ="unknown";
  countItems: number = 0;
  currencySymbol: string = "";
  subTotal: string = "";
  shipping: string = "";
  total: string = "";
  items: any;
  products: Product[];
  result: any;
  onRemove = false;
  onAdd = false;

  constructor(
    private activeOrderService: ActiveOrderService
  ) {
    this.countItems = 0;
  }

  ngOnInit() {
    this.getUserName();
    this.getActiveOrder("");
    this.activeOrderService.removeForActiveOrder.subscribe((onRemove: boolean) => {
      this.onRemove = onRemove;
      console.log('!!!onRemove!!! ' + onRemove);
      //this.getUserName();
      //this.getActiveOrder(Date.now().toString());
      this.getActiveOrder("");
      //console.log('Remove getActiveOrder.');
    })

    //this.getActiveOrder("");
  }

  getUserName() {
    this.activeOrderService.getUserName()
      .subscribe(
        (data: any) => {
          this.userName = data.userName;
          //this.result = data.username;
          //let test =  JSON.stringify(data.response.userName);
          console.log("Result getUserName: " + data.userName)
        },
        error => console.log("Error getUserName: " + error)
        // (data: any) => {
        //   this.userName = data.userName;
        // }
      );
  }

  getActiveOrder(t: string) {
    this.activeOrderService.getTotal(t)
      .subscribe(
        (data: any) => {
          try {
            console.log('OK getActiveOrder:' + data);
            this.countItems = data.itemsCount;
            this.currencySymbol = data.currency.symbol;
            this.subTotal = data.subTotal.currency.symbol + data.subTotal.amount;
            if (data.shippingPrice.amount === 0) {
              this.shipping = 'Free';
            } else {
              this.shipping = data.shippingPrice.currency.symbol + data.shippingPrice.amount;
            }
            this.total = data.total.currency.symbol + data.total.amount;
            this.fillProducts(data);
          }
          catch (e) {
            console.log('Hook getActiveOrder:' + e);
          }
        },
        error => console.log("Error getActiveOrder: " + error)
      );
  }

  fillProducts(data: any) {
    if (data == null) {
      console.log('null catch')
    }
    try {
      this.products = new Array<Product>();
      let _addedProducts = new Array<AddedProduct>();
      for (var i in data.items) {
        let product = new Product();
        let productProperties = new ProductProperties();
        let priceProduct = new ProductPrice();

        productProperties.productId = data.items[i].productId;
        productProperties.name = data.items[i].name;
        productProperties.sku = data.items[i].sku;
        for (var j in this.categories) {
          if (data.items[i].categoryId == this.categories[j].id) {
            productProperties.category = this.categories[j].name;
            break;
          }
        }
        priceProduct.id = data.items[i].id;
        priceProduct.productId = data.items[i].productId;
        priceProduct.currency = data.items[i].salePrice.currency.symbol;
        priceProduct.price = data.items[i].salePrice.amount;
        priceProduct.count = data.items[i].quantity;
        product.productProperties = productProperties;
        product.productPrice = priceProduct;
        let item = new AddedProduct(priceProduct.id, priceProduct.productId, priceProduct.count);
        _addedProducts.push(item);
        this.products.push(product);
      }
      console.log('fill: ' + this.products.length);
      this.activeOrderService.afterLoad(_addedProducts);
    } catch (e) {
      console.log('catch works!!!');
      this.activeOrderService.afterRemovedForTable();
    }
    // this.activeOrderService.afterRemovedForTable();
  }

  clear() {
    //console.log('Remove all');
    this.activeOrderService.Clear();
  }
}

