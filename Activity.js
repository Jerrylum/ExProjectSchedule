class Activity {

    constructor(n, d, dd) {
        this.name = n;
        this.dependency = d;
        this.duration = dd;

        this.num1 = 0;
        this.num2 = dd;
        this.num3 = 0;
        this.num4 = 0;
        this.num5 = 0;
        this.num6 = 0;
    }

    familiarize() {
        this.connectTo = [];

        for (let key in all_activity) {
            if (all_activity[key].dependency.indexOf(this.name) != -1)
                this.connectTo.push(key);
        }

        if (this.connectTo.length == 0 && this.name != "end") {
            this.connectTo.push("end");
            all_activity["end"].dependency.push(this.name);
        }
    }

    calculateTop(parentNeedTime) {
        //console.log(this.name +">")
        this.num1 = Math.max(this.num1, parentNeedTime);
        //this.num2 ok
        this.num3 = this.num1 + this.duration;

        this.connectTo.forEach((x) => { all_activity[x].calculateTop(this.num3); });

        this.calculateBottom();
    }

    calculateBottom() { //console.log(this.name +"<")
        if (this.name == "end") {
            this.num6 = this.num3;
        } else {
            this.num6 = Number.MAX_VALUE;
            this.connectTo.forEach((x) => {
                console.log(this.name + " | " + this.num6 + " ? " + x + ":" + all_activity[x].num4)
                this.num6 = Math.min(this.num6, all_activity[x].num4);
            });
        }
        this.num4 = this.num6 - this.num2;
        this.num5 = this.num4 - this.num1;
    }
}