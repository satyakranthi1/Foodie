import { Component, OnInit, Input } from '@angular/core';
import { RestaurantsService } from 'src/app/restaurants/restaurants.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cuisine-item',
  templateUrl: './cuisine-item.component.html',
  styleUrls: ['./cuisine-item.component.css']
})
export class CuisineItemComponent implements OnInit {
  @Input() cuisine: {id: string, cuisineName: string};
  constructor(
    private restaurantsService: RestaurantsService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  async goToRestaurants(id: string, cuisineName: string) {
    console.log(`Clicked cuisine: ${cuisineName}`);
    await this.restaurantsService.setCurrentCuisine(id, cuisineName);
    this.router.navigate(['restaurants'], { relativeTo: this.route });
  }

}
