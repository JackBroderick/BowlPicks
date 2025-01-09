import React, { ReactElement, useState } from 'react';
import { Container, Row, Col, Card, Breadcrumb, Tabs, Tab} from 'react-bootstrap'
import { iUserObject, iGroupObject, iGameObject, iTeamObject, iGameManagerObject, iPicksObject } from '../functions/interfaces';
import { ImageCircle } from './common';
import { WebResources, Styles } from '../functions/constants';
import { ListManager} from 'react-beautiful-dnd-grid';
const dateFormat = require('dateformat');
const emoji = require('node-emoji');

const defaultCardWidth: number = 30;


interface iGameManager {
    //user: iUserObject;
    //group: iGroupObject | null;
    confidenceMode: boolean;
    UI: iGameManagerObject;
    games: Array<iGameObject>;
    updatePicks?: Function;
}

export const GameManager: React.FunctionComponent<iGameManager> = function ({ ...props }): React.ReactElement {

    const updateConfidenceOrder = function (sourceIndex: number, destinationIndex: number): void {
        if (sourceIndex !== destinationIndex) {
            const newPickList: Array<iGameObject> = Array.from(props.games);
            const [removedItem]: Array<iGameObject> = newPickList.splice(sourceIndex, 1);
            newPickList.splice(destinationIndex, 0, removedItem);
            for (let i: number = 0; i < newPickList.length; i++) {
                newPickList[i].game_index = i;
                newPickList[i].pick_confidence = i + 1;
            }
            if (props.updatePicks) { props.updatePicks(newPickList) };
        }
    }

    const makePick: Function = function (gameIndex: number, pickID: number) {
        //const newPicks: Array<iPicksObject> = Array.from(pickList);
        const newPicks: Array<iGameObject> = props.games.map((el: iGameObject) => (
            Object.assign({}, el)
        ))

        newPicks[gameIndex].pick_id = pickID;
        if (pickID === props.games[gameIndex].home_team.team_id) {
            newPicks[gameIndex].visitor_team.pick = false;
            newPicks[gameIndex].home_team.pick = true;
        } else if (pickID === props.games[gameIndex].visitor_team.team_id) {
            newPicks[gameIndex].visitor_team.pick = true;
            newPicks[gameIndex].home_team.pick = false;
        }
        if (props.updatePicks) {
            props.updatePicks(newPicks);
        }
    }

    const getDisplay: Function = function (): string {
        if (props.UI.viewMode === 'card') {
            return 'flex';
        } else if (props.UI.viewMode === 'list') {
            return 'block';
        } else if (props.UI.viewMode === 'carousel') {
            return 'flex';
        }
        return '';
    }

    const getView: Function = function (item:iGameObject): React.ReactElement {
        if (props.UI.viewMode === 'card') {
            return <GameCard game={item} scale={props.UI.zoomScale} maxGames={props.games.length} makePick={(gameIndex: number, pickID: number) => { makePick(gameIndex, pickID) }} />
        } else if (props.UI.viewMode === 'list') {
            return <GameList game={item} scale={props.UI.zoomScale} maxGames={props.games.length} makePick={(gameIndex: number, pickID: number) => { makePick(gameIndex, pickID) }} />
        } else if (props.UI.viewMode === 'carousel') {

        }
        return <></>
    }

    const getViewContainer: Function = function (): React.ReactElement {

        const listWidth: string = props.UI.viewMode === 'list' ? '100%' : '';

        if (props.UI.showCalendar) {
            const pickListCopy: Array<iGameObject> = props.games.map((el: iGameObject) => (Object.assign({}, el)))
            const gameDays: Array<Date> = pickListCopy.sort((item1: iGameObject, item2: iGameObject) => {
                return (item1.game_date && item2.game_date ? new Date(item1.game_date).getTime() - new Date(item2.game_date).getTime() : 0)
            }).map((el:iGameObject)=>(el.game_date?el.game_date:new Date())).filter((gameDate:Date,position:number, array:Array<Date>)=>(!position||gameDate !== array[position-1]));

            const closestDate: Date = gameDays.reduce((item1: Date, item2: Date) => (new Date(item1).getTime() - new Date().getTime() < new Date(item2).getTime() - new Date().getTime() ? item1 : item2));
            
            return (
                <Tabs defaultActiveKey={ dateFormat(closestDate,'mm-dd-yyyy')} style= {{width:'100%', display:'flex' }}>
                        {
                            gameDays.map((el: Date, index: number) => (
                                <Tab eventKey={dateFormat(el,'mm-dd-yyyy')} title={dateFormat(el, 'ddd mmm d')}>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
                                        {props.games.filter((game:iGameObject)=>(dateFormat(game.game_date,'mm-dd-yyyy')===dateFormat(el,'mm-dd-yyyy'))).map((element: iGameObject, index: number) => (
                                            <li style={{ float: 'left', width: listWidth }} key={index.toString()} >
                                                {getView(element)}
                                            </li>
                                        ))}
                                    </ul>
                                </Tab>
                            ))
                        }
                </Tabs >
            )
        } else {
            if (!props.UI.tournamentStarted && props.confidenceMode) {
                return (
                    <ListManager
                        items={props.games}
                        direction={props.UI.viewMode === 'card' ? 'horizontal' : 'vertical'}
                        maxItems={1}
                        render={
                            (item: iPicksObject) => getView(item)
                        }
                        onDragEnd={updateConfidenceOrder}
                    />
                )
            } else {
                
                return (
                    <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
                        {props.games.map((el: iGameObject, index: number) => (
                            <li style={{ float: 'left', width: listWidth }} key={index.toString()} >
                                {getView(el)}
                            </li>
                        ))}
                    </ul>
                )
            }
        }
    }

    return (
        <Container fluid>
            <div style={{ display: getDisplay(), flexWrap: 'wrap', alignContent: 'flex-start', width: '100%', height: '100%'}}>
                {getViewContainer()}
            </div>
            <br />
        </Container>
    )
}

interface iGame {
    game: iGameObject;
    maxGames: number;
    scale?: number;
    makePick?: Function;
}

const getGameBackGround: Function = function (gameStatus:String): string {
    switch (gameStatus.toLowerCase()) {
        case 'pending':
            return 'info';
            break;
        case 'scheduled':
            return 'primary'
            break;
        case 'final':
            return 'Danger';
            break;
        case 'cancelled':
            return 'Danger';
            break;
        default:
            return 'Success';
    }
}

const checkNullString: Function = function (input: string | number | null | undefined): string {
    return input ? input.toString() : '';
}

const checkNullNumber: Function = function (input: number | null | undefined): number {
    return input ? input : 0;
}

const scaleSize: Function = function (scale:number|undefined, baseLine: number, suffix: string): string {
    const scaler: number = scale ? scale : 1;
    return (baseLine * scaler).toString() + suffix;
}

const getTeamRank: Function = function (rank: number | undefined): string {
    const teamRank: number = rank && rank > 0 ? rank : 0;
    return teamRank > 0 ? '#' + teamRank.toString() + ' ' : '';
}

const showPossession: Function = function (hasPossession: boolean): string {
    if (hasPossession) {
        return emoji.emojify(':football:')
    } else {
        return '';
    }
}

const getPickString: Function = function (game:iGameObject): string {
    if (game.home_team.pick) {
        return game.home_team.school_name + ' ' + game.home_team.team_name + ' ' + getGameSpread(game.spread*-1)
    } else if (game.visitor_team.pick) {
        return game.visitor_team.school_name + ' ' + game.visitor_team.team_name + ' ' + getGameSpread(game.spread);
    }
    return '';
}

const getGameSpread: Function = function (spread: number): string {
    if (spread === 0) {
        return 'EVEN';
    } else if (spread < 0) {
        return '- ' + Math.abs(spread);
    } else {
        return '+ ' + Math.abs(spread);
    }
}

const getTeamLink: Function = function (teamNameSearch: String, gameDate: Date | undefined): string {
    let dateString: string = gameDate ? new Date(gameDate).getFullYear().toString() : new Date().getFullYear().toString()
    return WebResources.cfbSR_team + teamNameSearch + '/' + dateString + '-schedule.html';
}

const GameList: React.FunctionComponent<iGame> = function ({ ...props }): React.ReactElement {
    const colSize: number = 3.5;
    const pickFunction: Function = props.makePick ? props.makePick : () => { };

    const teamElement: Function = function (team: iTeamObject, spreadMultiplier:number = 1): ReactElement {
        return (
            <Container fluid>
                <div style={{ width: '100%', textAlign:'center'}}>
                    <span style={{ textAlign: 'center', opacity: team.pick ? 1 : .5  }}>
                        <ImageCircle pictureLocation={team.logo_link} dimensions={scaleSize(props.scale, 50, 'px')} borderSelect={team.pick} onClickFunction={() => {pickFunction(props.game.game_index, team.team_id)}} />
                    </span>
                    <a target="_blank" href={team.link}>
                        <span style={{ fontSize: scaleSize(props.scale, 1.2, 'rem'), textAlign: 'center' }}>
                            <span>{getTeamRank(team.team_rank) + team.school_name + ' ' + team.team_name + ' ' + team.team_record}</span>
                        </span>
                    </a>
                    <br />
                    <span style={{ fontSize: scaleSize(props.scale, .7, 'rem') }}>{showPossession(team.possession)}</span>
                    <span style={{ fontSize: scaleSize(props.scale, 2.5, 'rem'), textAlign: 'center' }}>{team.score}</span>
                    <br />
                    <span style={{ fontSize: scaleSize(props.scale, 1, 'rem') }}>{'Spread: ' + getGameSpread(props.game.spread*spreadMultiplier)}</span>
                </div>
            </Container>
        )
    }

    return (
            <Card className="d-inline-block align-middle ml-sm-1 mr-sm-1 mb-sm-1 mt-sm-1" border={getGameBackGround(props.game.game_status).toLowerCase()} style={{width:'100%', textAlign:'center'}}>
                <Container style={{ textAlign: 'center' }} fluid>
                    <Row>
                        <Col>
                            <span style={{ fontSize: scaleSize(props.scale, 1.3, 'rem'), textAlign: 'center' }}>
                                <a href={WebResources.cfbSR_bowl + props.game.bowl.replace(/ /g, "-").toLowerCase() + ".html"} target="_blank">
                                    {props.game.bowl}
                                </a>
                            </span>
                            <span className="text" style={{ textAlign: 'center', fontSize: scaleSize(props.scale, 1.1, 'rem') }}> {'(' + props.game.location+ ')'}</span>
                            <br />
                            <span className="text-muted" style={{ textAlign: 'center' }}> <small>{dateFormat(props.game.game_date, 'dddd, mmmm dS, yyyy " at " h:MM TT Z') + ' on ' + props.game.network}</small></span>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {teamElement(props.game.visitor_team)}
                        </Col>
                    <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize} style={{textAlign:'center'}}>
                        <div><small className="mb-2 text-muted">{'Game Status: ' + props.game.game_status}</small></div>
                        <div><small className="mb-2 text-muted">{'Last Play: ' + props.game.last_play}</small></div>
                        <div style={{ fontSize: scaleSize(props.scale, 1, 'rem'), textAlign: 'center' }}>
                            <span>{'Pick: '}</span>
                            <a target="_blank" href={getTeamLink(props.game.home_team.pick ? props.game.home_team.search_name : props.game.visitor_team.search_name, props.game.game_date)}>
                                {getPickString(props.game)}
                            </a>
                            <br />
                            <span><small className="mb-2 text-muted">{'Confidence Level: ' + checkNullString(props.game.pick_confidence) + ' (+ ' + (props.maxGames - checkNullNumber(props.game.pick_confidence)).toString() + ' pts)'}</small></span>
                        </div>
                        <div style={{ fontSize: scaleSize(props.scale, 1.5, 'rem'), textAlign: 'center' }}>{'Total points: ' + props.game.points}</div>
                        </Col>
                        <Col>
                            {teamElement(props.game.home_team, -1)}
                        </Col>
                    </Row>
                </Container>
            </Card>
    )
}

const GameCard: React.FunctionComponent<iGame> = function ({ ...props }): React.ReactElement {

    const colSize: number = 2.5;
    const pickFunction = props.makePick ? props.makePick : () => { };
    const [pickID, updatePickID] = useState(0);
    const [pickStatus, updatepickStatus] = useState(props.game.game_status.toLowerCase() === 'pending');
    const teamElement: Function = function (team:iTeamObject): ReactElement {
        return (
            <Container>
                <span style={{ textAlign: 'center', opacity:team.pick?1:.5 }}>
                    <ImageCircle pictureLocation={team.logo_link} dimensions={scaleSize(props.scale, 60, 'px')} borderSelect={team.pick} onClickFunction={() => { pickFunction(props.game.game_index, team.team_id) }} />
                </span>
                <br />
                <p style={{ fontSize: scaleSize(props.scale,1.1, 'rem'), textAlign: 'center' }}>
                    <a target="_blank" href={team.link}>
                        <div>{getTeamRank(team.team_rank) + team.school_name}</div>
                        <div>{team.team_record}</div>
                    </a>
                    <br />

                    
                </p>
            </Container>
        )
    }

    return (
        <Card className="d-inline-block align-middle ml-sm-1 mr-sm-1 mb-sm-1 mt-sm-1" border={getGameBackGround(props.game.game_status).toLowerCase()} style={{ fontSize:scaleSize(props.scale, 1,'rem'),width: scaleSize(props.scale, defaultCardWidth, 'rem') }}>
                <Container style={{ textAlign: 'center' }} fluid>
                    <Row>
                        <Col>
                            <span style={{ fontSize: scaleSize(props.scale, 1.5, 'rem'), textAlign: 'center' }}>
                                <a href={WebResources.cfbSR_bowl + props.game.bowl.replace(/ /g, "-").toLowerCase() + ".html"} target="_blank">
                                    {props.game.bowl}
                                </a>
                            </span>
                            <br />
                            <span className="text-muted" style={{ textAlign: 'center' }}> <small>{dateFormat(props.game.game_date, 'dddd, mmmm dS, yyyy " at " h:MM TT Z')}</small></span>
                            <br />
                            <span className="text" style={{ textAlign: 'center' }}> {props.game.location}</span>
                            <br />
                            <span className="text-muted" style={{ textAlign: 'center' }}><small> {props.game.network}</small></span>
                        </Col>
                    </Row>
                </Container>
                 <Container>
                    <Row className="justify-content-md-center" style={{ height:scaleSize(props.scale, 5, 'rem') }}>
                            <Col style={{ textAlign: 'center' }}>
                                {teamElement(props.game.visitor_team)}
                            </Col>
                            <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize}>
                                <Container style={{textAlign:'center'}}>
                                    <br />
                                    <span >{'vs'}</span>
                                    <br />
                                    <span >{getGameSpread(props.game.spread)}</span>
                                </Container>
                            </Col>
                            <Col style={{ textAlign: 'center'}}>
                                {teamElement(props.game.home_team)}
                            </Col>
                    </Row>
                    {!pickStatus
                        ?
                        <>

                        </>
                        :
                        <>
                        <Row className="justify-content-md-center">
                            <Col>
                                <Container ></Container>
                            </Col>
                            <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize}>
                                {/*<div style={{ ...Styles.sContainerBorder, fontSize: scaleSize(props.scale, 1.8, 'rem'), textAlign: 'center', backgroundColor:"Ivory", cursor:"pointer" }}>{'#' + checkNullString(props.game.pick_confidence)}</div>*/}   
                            </Col>
                            <Col>
                                <Container ></Container>
                            </Col>
                        </Row>
                               
                        <Row className="justify-content-md-center">
                            <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize}>
                            {/*<div style={{ fontSize: scaleSize(1.8, 'rem'), textAlign: 'left' }}><ImageCircle pictureLocation={'/images/left_arrow.png'} dimensions={ scaleSize(props.scale, 40,'px')}/></div>*/}
                            </Col>
                            <Col style={{ textAlign: 'center' }}>
                                <div><small className="mb-2 text-muted">{'Game Status: ' + props.game.game_status}</small></div>
                                <div><small className="mb-2 text-muted">{'Last Play: ' + props.game.last_play}</small></div>
                            </Col>
                            <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize}>
                            {/*<div style={{ fontSize: scaleSize(1.8, 'rem'), textAlign: 'right' }}><ImageCircle pictureLocation={'/images/right_arrow.png'} dimensions={scaleSize(props.scale, 40, 'px')} /></div>*/}
                            </Col>
                        </Row>
                        <Row className="justify-content-md-center">
                            <Col>
                                <div style={{ fontSize: scaleSize(props.scale, 1, 'rem'), textAlign: 'center' }}>
                                    <span>{'Pick: '}</span>
                                    <a target="_blank" href={getTeamLink(props.game.home_team.pick?props.game.home_team.search_name:props.game.visitor_team.search_name, props.game.game_date)}>
                                        {getPickString(props.game)}
                                    </a>
                                    <br />
                                    <span><small className="mb-2 text-muted">{'Confidence Level: ' + checkNullString(props.game.pick_confidence) + ' (+ ' + (props.maxGames - checkNullNumber(props.game.pick_confidence)).toString() +  ' pts)'}</small></span>
                                </div>
                                
                            </Col>
                        </Row>
                        <Row >
                            <Col style={{textAlign:'center'}}>
                                <span style={{ fontSize: scaleSize(props.scale, .7, 'rem') }}>{showPossession(props.game.visitor_team.possession)}</span>
                                <span style={{ fontSize: scaleSize(props.scale, 2.5, 'rem'), textAlign: 'center' }}>{props.game.visitor_team.score}</span>
                            </Col>
                            <Col xs={colSize} sm={colSize} md={colSize} lg={colSize} xl={colSize} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                <Container>
                                    <br />
                                    <span style={{ fontSize: scaleSize(props.scale, 1.5, 'rem') }}>
                                        {'Total points: ' + props.game.points}
                                    </span>
                                </Container>
                            </Col>
                            <Col style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: scaleSize(props.scale, .7, 'rem') }}>{showPossession(props.game.home_team.possession)}</span>
                                <span style={{ fontSize: scaleSize(props.scale, 2.5, 'rem') }}>{props.game.home_team.score}</span>
                            </Col>
                        </Row>

                            </>
                        }
                    </Container>
        </Card>
    )
}
