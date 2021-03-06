import {Component, OnInit, EventEmitter, Input, ElementRef} from 'angular2/core';
import * as types from '../types';
import {AutosizeDirective} from '../directives/autosize.directive';
import {AutoscrollDirective} from '../directives/autoscroll.directive';
import {DatabaseService} from '../services/database.service';
import {EmitterService} from '../services/emitter.service';

declare var $: any;

@Component({
    selector: 'div[name=chat]',
    templateUrl: '/partials/chat.html',
    providers: [EmitterService],
    directives: [AutosizeDirective, AutoscrollDirective],
})

export class ChatComponent implements OnInit {

    emitterAutoscroll: EventEmitter<any>;
    @Input('user') user: any;
    isLoading: boolean = true;
    total: number = null;
    messages: any;
    iMessage: string;
    sent: boolean = false;

    constructor(public elementRef: ElementRef, public dbService: DatabaseService) {
        this.messages = this.dbService.getMessages();
        this.iMessage = null;
        this.emitterAutoscroll = EmitterService.get('channel_autoscroll');
    }

    ngOnInit() {
        let self = this;
        this.messages.subscribe((l) => {
            self.isLoading = false;
            self.total = l.length;
            self.emitterAutoscroll.emit(true);
        });
    }

    focus() {
        $(this.elementRef.nativeElement).find('textarea').focus();
    }

    send(message: string) {
        message = message.replace(/^\s+|\s+$/g, '')
        if (message.length) {
            let self = this;
            let msgObj: types.Message = {
                user_id: this.user.id,
                user_name: this.user.name,
                content: message
            }
            this.dbService.saveMessage(msgObj).then(function(response) {
            }, function(error) {
                console.error(error);
            });
        }
        this.iMessage = null;
    }

    remove(key: string, userId: string): any {
        if (userId !== this.user.id || this.user.id == null) {
            return false;
        }
        return this.dbService.deleteMessage(key).then(function(response) {
        }, function(error) {
            console.error(error);
        });
    }

    clearAll() {
        return this.dbService.clearMessages();
    }
}