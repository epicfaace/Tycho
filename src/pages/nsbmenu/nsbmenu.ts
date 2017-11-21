import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {NsbappPage} from "../nsbapp/nsbapp";
import { ApiService } from '../../app/services/ApiService';
import { NSBService } from '../../app/services/NSBService';

/**
 * Generated class for the NsbmenuPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-nsbmenu',
  templateUrl: 'nsbmenu.html',
  providers: [ApiService, NSBService]
})
export class NsbmenuPage {
  NsbappPage = NsbappPage;
  data: any;
  options: any;
  optionValues: any;
  setInfo: any;
  setChosen: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public apiService: ApiService, public nsbService: NSBService) {
  }

  ngOnInit() { //runs only on init.
    (<any>window).This = this;
    this.options = this.nsbService.options;
    this.optionValues = this.nsbService.optionValues;
    this.setChosen = null;
    this.nsbService.loadMetaData();

    console.log('ionViewDidLoad NsbappPage');

    console.log('ngoninit nsbmenupage');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NsbmenuPage');
  }

  trackByFn(index, item) {
    return index;
  }

  getSets() {
    let sets = [];
    for (let setNum in this.nsbService.metadata[this.options.vendorNum]) {
      sets.push(setNum);
    }
    return sets;
  }

  prettifyVendorName(name) {
    switch (name) {
      case "DOE-MS":
        return "DOE Website Official Sample Questions";
      case "DOE-HS":
        return "DOE Website Official Sample Questions";
      case "SAMPLE-RR-HS":
        return "Sample RR (easy and medium)";
      case "SAMPLE-DE-HS":
        return "Sample DE (difficult)";
      default:
        return name;
    }
  }

  getVendors() {
    let vendors = [];
    for (let vendorNum in this.nsbService.metadata) {
      if (~vendorNum.indexOf("-" + this.options.difficulty))
        vendors.push(vendorNum);
    }
    // Set default vendorNum
    if (!~vendors.indexOf(this.options.vendorNum)) {
      this.options.vendorNum = vendors[0];
    }

    return vendors;
  }

  getPackets() {
    let packets = [];
    for (let packetNum in this.nsbService.metadata[this.options.vendorNum][this.options.setNum]) {
      packets.push(packetNum);
    }
    return packets;
  }

  navigateNsbappPage() {
    var packetInfo = this.nsbService.metadata[this.options.vendorNum][this.options.setNum][this.options.packetNum];
    this.navCtrl.push(NsbappPage, {
      options: this.nsbService.options,
      numQuestions: packetInfo.numQuestions,
      fileName: packetInfo.fileName
    })
  }

}
