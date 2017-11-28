import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ApiService } from '../../app/services/ApiService';
import { TextToSpeech } from '@ionic-native/text-to-speech';
declare var window: any;

export interface optionsInterface {
    difficulty: string,
    mode: string,
    audio: string,
    vendorNum: string,
    setNum: string,
    packetNum: string,
    category: number
}

@Injectable()
export class NSBService {
  public options: optionsInterface;
  public optionValues: any;
  public metadata: any;
  public setInfo: any;

  constructor(private http:Http, public apiService: ApiService, public tts: TextToSpeech) {
    this.optionValues = {
        difficulty: [
            {"label": "Middle School", value: "MS"},
            {"label": "High School", value: "HS"}
        ],
        mode: [
            {"label": "Reader mode", value: "READER"},
            {"label": "Game mode", value: "GAME"}
        ],
        audio: [
            {"label": "Audio on (Read questions out loud)", value: "TRUE"},
            {"label": "Audio off (Text only)", value: "FALSE"}
        ],
        vendorNum: String,
        setNum: String,
        packetNum: String,
        category: [
            {"value": -1, "name": "ALL CATEGORIES"},
            {"value": 0, "name": "EARTH AND SPACE"},
            {"value": 0, "name": "EARTH AND SPACE SCIENCE"},
            {"value": 1, "name": "BIOLOGY"},
            {"value": 2, "name": "CHEMISTRY"},
            {"value": 3, "name": "PHYSICS"},
            {"value": 4, "name": "MATHEMATICS"},
            {"value": 5, "name": "ENERGY"},
            {"value": 6, "name": "GENERAL SCIENCE"},
            {"value": 7, "name": "COMPUTER SCIENCE"}
        ]
    }
    this.options = {
        difficulty: "HS",
        mode: "GAME",
        audio: "FALSE",
        vendorNum: "DOE-MS",
        setNum: "1",
        packetNum: "1",
        category: this.optionValues.category[0]
    };
}

    loadMetaData() {
        this.apiService.presentLoadingCustom();
        return this.apiService.getNSBMetadata().subscribe(metadata => {
          (<any>window).loading.dismiss();
          console.log(metadata);
          this.metadata = metadata;
          
        });
    }

    getQuestionsBySetKey(setKey) {
        return this.apiService.getJSONFile("assets/files/questions/all.json").map(data => {
            return data[setKey];
        });
    }

    getRandomQuestionsByCategory(categoryNum) {
        categoryNum = parseInt(categoryNum);
        return this.apiService.getJSONFile("assets/files/questions/all.json").map(data => {
            console.log(data);
            data = this.filterQuestionsByCategory(data, parseInt(categoryNum));
            console.log(data);
            this.shuffle(data);
            console.log("data is");
            console.log(data);
            return data;
        });
    }

    filterQuestionsByCategory(data, categoryNum) {
        var allQuestions = [];
        var maxNumQuestions = 100;
        for (let key in data) {
            for (let i in data[key]) {
                if (allQuestions.length == maxNumQuestions) {
                    return allQuestions;
                }
                let question = data[key][i];
                if (categoryNum == -1 || question.category == categoryNum) {
                    allQuestions.push(question);
                }
            }
        }
        return allQuestions;
    }

    /* From https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array */
    /* Shuffles an array in place. */
    shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    getSetAndFilter(options, fileName) {
        // gets set by file name, and then filters it.
        this.apiService.presentLoadingCustom();
        if (!fileName && options.vendorNum == 'RANDOM') {
            return this.getRandomQuestionsByCategory(options.category.value).map(data => {
                (<any>window).loading.dismiss();
                return this.formatMultipleChoice(data);
            });
        }
        else {
            return this.getQuestionsBySetKey(fileName).map(data => {
                (<any>window).loading.dismiss();
                return this.formatMultipleChoice(data);
            });
        }
    }

    formatMultipleChoice(array) {
        for (let i in array) {
            array[i]["tossupQ"] = this.addLineBreaksToMultipleChoice(array[i]["tossupQ"]);
            array[i]["bonusQ"] = this.addLineBreaksToMultipleChoice(array[i]["bonusQ"]);
        }
        return array;
    }

    addLineBreaksToMultipleChoice(text) {
        return text.replace(/([W-Z]\))/g, "<br>$1");
    }

    timeUp() {
        let alert = this.apiService.alertCtrl.create({
            title: 'Time up!',
            subTitle: 'Time\'s up.',
            buttons: ['OK']
          });
        alert.present();
    }

    speakText(text) {
        /* Speaks given text (question or answer) by first converting it to HTML.
         */
        var speed = 1;
        if(window.cordova)
        if(window.device.platform == 'iOS')
            if(window.device.version.charAt(0) == '1' && window.device.version.charAt(1) == '1')
                speed = 1.5; // ios 11 fix.

        this.tts.speak({
            text: this.htmlToPlaintext(text),
            rate: speed
        })
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
    }

    stopSpeaking() {
        /* Stops speaking all text; called when user leaves window.
         * stop() function doesn't work so speaks empty text instead to work around that.
         */
        this.tts.speak("");
    }

    htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }

}
