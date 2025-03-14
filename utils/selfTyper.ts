/**
 * Following two classes are used to create a chatGPT-like typing effect of any
 * text in the HTML element. These typers can be easily chained to create a
 * sequence of typing effects, where the next typer starts typing after the
 * previous one finishes. This can be done by adding several instances of
 * SelfTyper to the TyperController property typerList.
 *
 * Example usage:
 * Auto typing of messages from the AI chat on Analyze with AI page.
 */
export class TyperController {
    curTyperIndex: number;
    randomFill: string[];
    typerList: any;
    changeIterations: number;
    spaceDelay: number;
    typingSpeed: number;

    constructor(changeIterations: number, spaceDelay: number, typingSpeed: number) {
        this.curTyperIndex = 0;
        this.typerList = [];
        this.randomFill = ["█"];
        this.changeIterations = changeIterations;
        this.spaceDelay = spaceDelay;
        this.typingSpeed = typingSpeed;
    }
}

export default class SelfTyper {
    element: HTMLElement;
    typerController: TyperController;
    curText: string;
    goalText: string;
    triggerNextTyperOnCharacter: number | null;
    isTypingHtmlNow: boolean;
    typingStarted: boolean;
    customTypingSpeed: number | null;
    onFinishedTyping: Function;

    constructor(element: HTMLElement, typerController: TyperController, autoStart = false, triggerNextTyperOnCharacter = null) {
        this.element = element;
        this.typerController = typerController;
        this.curText = "";
        this.goalText = element.innerHTML;
        this.triggerNextTyperOnCharacter = triggerNextTyperOnCharacter;
        this.isTypingHtmlNow = false;
        this.typingStarted = false;
        this.customTypingSpeed = null;

        this.onFinishedTyping = function () {
            console.log("Finished typing");
        };

        element.innerHTML = "";

        if (element != null && typerController != null) {
            typerController.typerList.push(this);

            if (autoStart) {
                this.selfType();
            }
        } else {
            console.error("SelfTyper: element or typerController is null");
        }
    }

    selfType(i = 0) {
        let that = this;
        this.typingStarted = true;

        setTimeout(
            function () {
                that.triggerNext(i);
                that.curText += that.goalText.charAt(i);

                if (that.goalText.charAt(i) == "<") {
                    that.isTypingHtmlNow = true;
                }

                if (that.isTypingHtmlNow && that.goalText.charAt(i) == ">") {
                    that.isTypingHtmlNow = false;
                }

                if (i != that.goalText.length - 1) {
                    // Generate random fill
                    if (!that.isTypingHtmlNow) {
                        for (let y = 0; y < that.typerController.changeIterations; y++) {
                            if (that.goalText.charAt(i + 1) != undefined) {
                                that.generateRandomFill(y, that.goalText.charAt(i + 1));
                            } else {
                                that.generateRandomFill(y);
                            }
                        }
                    }

                    that.selfType(i + 1);
                }

                that.element.innerHTML = that.curText;
            },
            i == 0 || that.isTypingHtmlNow ? 0 : that.goalText.charAt(i) == " " ? that.getTypingSpeed() * that.typerController.spaceDelay : that.getTypingSpeed() * that.getRandomInt(1, 1.25),
        );
    }

    generateRandomFill(i: number, curChar = "") {
        let that = this;
        setTimeout(
            function () {
                that.element.innerHTML = that.curText + that.typerController.randomFill[that.getRandomInt(0, that.typerController.randomFill.length - 1)];
            },
            curChar == " "
                ? ((that.getTypingSpeed() * that.typerController.spaceDelay) / that.typerController.changeIterations) * i
                : (that.getTypingSpeed() / that.typerController.changeIterations) * i,
        );
    }

    triggerNext(characterIndex: number) {
        // characterIndex = -1 is end of the sentence
        if (this.triggerNextTyperOnCharacter) {
            if (characterIndex == this.triggerNextTyperOnCharacter || (characterIndex == this.goalText.length - 1 && this.triggerNextTyperOnCharacter == -1)) {
                this.typerController.curTyperIndex++;

                let nextTyper = this.typerController.typerList[this.typerController.curTyperIndex];

                if (nextTyper) {
                    if (!nextTyper.typingStarted) {
                        nextTyper.selfType();
                    }
                }
            }
        }

        // On the end of the sentence
        if (characterIndex == this.goalText.length - 1) {
            this.onFinishedTyping();
        }
    }

    setFinishedTypingFunction(func: Function) {
        this.onFinishedTyping = func;
    }

    setCustomTypingSpeed(speed: number) {
        this.customTypingSpeed = speed;
    }

    getTypingSpeed() {
        if (this.customTypingSpeed) {
            return this.customTypingSpeed;
        } else {
            return this.typerController.typingSpeed;
        }
    }

    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
