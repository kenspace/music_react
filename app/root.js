import React from 'react';
import Header from './components/header';
import Player from './page/player';
import MusicList from './page/musiclist';
import  { MUSIC_LIST } from './config/musiclist';
import Pubsub from 'pubsub-js';
import  { Router, IndexRoute, Link, Route, hashHistory } from 'react-router';

let App = React.createClass({
    getInitialState(){
        return{
            currentMusicItem:MUSIC_LIST[0],
            musicList:MUSIC_LIST,
        }
    },
    playMusic (musicItem){
        $('#player').jPlayer('setMedia',{mp3:musicItem.file}).jPlayer('play');

        this.setState({
            currentMusicItem:musicItem
        });
    },

    playNext(type = 'next'){
        let index = this.findMusicIndex(this.state.currentMusicItem);
        let newIndex = null;
        let musicLength =this.state.musicList.length;
        if(type==='next'){
            newIndex = (index + 1)% musicLength;
        }else {
            newIndex = (index - 1 + musicLength)%musicLength;
        }
        this.playMusic(this.state.musicList[newIndex]);
    },
    findMusicIndex(musicItem){
        return this.state.musicList.indexOf(musicItem);
    },
    componentDidMount(){
        $('#player').jPlayer({
            supplied:'mp3',
            wmode:'window'
        });
        this.playMusic(this.state.currentMusicItem);

        $('#player').bind($.jPlayer.event.ended,(e)=>{
            this.playNext();
        });

        Pubsub.subscribe('PLAY_MUSIC',(msg,musicItem)=>{
            this.playMusic(musicItem);
        });

        Pubsub.subscribe('DELETE_MUSIC',(msg,musicItem)=>{
            this.setState({
                musicList:this.state.musicList.filter(item=>{
                    return item !==musicItem;
                })
            })
        });

        Pubsub.subscribe('PLAY_PREV',(msg,musicItem)=>{
           this.playNext('prev');
        });
        Pubsub.subscribe('PLAY_NEXT',(msg,musicItem)=>{
            this.playNext();
        });
    },
    componentWillUnMount(){
        Pubsub.unsubscribe('PLAY_MUSIC');

        Pubsub.unsubscribe('DELETE_MUSIC');
        Pubsub.unsubscribe('PLAY_PREV');
        Pubsub.unsubscribe('PLAY_NEXT');

        $('#player').unbind($.jPlayer.event.ended);
    },
    render(){
        return(
            <div>
                <Header />
                {React.cloneElement(this.props.children ,this.state)}
            </div>
        )
    }
});


let Root = React.createClass({
    render(){
        return(
            <Router history={hashHistory}>
                <Route path="/" component={App}>
                    <IndexRoute component={Player}></IndexRoute>
                    <Route path="/list" component={MusicList}></Route>
                </Route>
            </Router>
        )

    }
});

export default Root;