import React from "react";
import '../App.css';
import bridge from "@vkontakte/vk-bridge";


/*vk-tunnel --insecure=1 --http-protocol=https --ws-protocol=wss --host=localhost --port=10888*/



export class Block extends React.Component {
    constructor(props) {
        super(props);
        this.handlerNext = this.handlerNext.bind(this)
        this.handlerAnswers = this.handlerAnswers.bind(this)
        this.handlerChange = this.handlerChange.bind(this)
        this.handlerTruth = this.handlerTruth.bind(this)
        this.fetchHandler = this.fetchHandler.bind(this)
        this.amountHandler = this.amountHandler.bind(this)
        this.categoryHandler = this.categoryHandler.bind(this)

        this.state = {
            isFetching: true,
            error: null,
            index: 0,
            data: [],
            question_data: [],
            answers: "",
            answers_result: [],
            result: [],
            easy: [],
            medium: [],
            hard: [],
            easyAnswerContainer: [],
            mediumAnswerContainer: [],
            hardAnswerContainer: [],
            menu: true,
            modal_id: 1,
            amount_of_questions: "10",
            category: "",
            count_result: false,
        }
    }

    fetchHandler() {
        fetch(`https://opentdb.com/api.php?amount=${this.state.amount_of_questions}${this.state.category}&type=multiple&encode=base64`)
            .then(response=>response.json())
            .then(result=>{
                console.log(result.results)
                result.results.forEach((element) => {
                    element.difficulty = atob(element.difficulty)
                    element.category = atob(element.category)
                    element.question = atob(element.question)
                    element.correct_answer = atob(element.correct_answer)
                    element.incorrect_answers = element.incorrect_answers.map(function(str) {return atob(str)})
                })
                this.setState({
                    data: result.results,
                    isFetching: false,
                    question_data: result.results[0],
                })
                this.handlerAnswers()
            })
            .catch( e => {
                console.log(e);
                this.setState({
                    isFetching: false,
                    error: e
                });
            })
        this.setState({menu:false})
        console.log(this.state.category + " Кол-во вопросов: " + this.state.amount_of_questions)
    }

    handlerAnswers() {
        let answers_array = []
        answers_array.push(this.state.data[this.state.index].correct_answer, ...this.state.data[this.state.index].incorrect_answers)
        let shuffledArr = answers_array.sort(() => {
            return Math.random() - 0.5;
        });
        let blocks = shuffledArr.map( (blocks) => {
            return (
                <div className="col-6 d-flex justify-content-center d-flex align-items-center">
                    <button className="btn answer my-2 " key={blocks} onClick={this.handlerChange}>{blocks}</button>
                </div>
            )
        })
        this.setState({
            answers: blocks,
            index: this.state.index+1,
            buttonNext: <div key={this.state.index} className="text next d-flex justify-content-center d-flex align-items-center p-2" onClick={()=> {
                bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"})
                this.handlerNext()
                }}><div>Next</div></div>,
        })
        if (this.state.index === this.state.data.length-1) {
            this.setState({
                buttonNext: <div className="text next d-flex justify-content-center d-flex align-items-center p-2 " onClick={()=> {
                    bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"})
                    this.handlerTruth()
                    this.setState({count_result: true})
                }}><div>End</div></div>
            })
        }
    }

    handlerChange(e) {
        this.setState({
            [this.state.answers_result]: this.state.answers_result + this.state.answers_result.push(e.target.textContent)
        })
        console.log(this.state.answers_result)
    }

    handlerNext() {
        this.handlerAnswers()

        if(this.state.answers_result[this.state.answers_result.length-1] === this.state.data[this.state.index-1].correct_answer) {
            this.setState({
                [this.state.result]: this.state.result + this.state.result.push("Верно")
            })
        }else{
            this.setState({
                [this.state.result]: this.state.result + this.state.result.push("Неверно")
            })
        }
        this.setState({
            question_data: this.state.data[this.state.index],
        })
    }

    handlerTruth() {

        let truth = [];
        let searchTruth = "Верно";
        let id = this.state.result.indexOf(searchTruth);
        while (id !== -1) {
            truth.push(id + 1);
            id = this.state.result.indexOf(searchTruth, id + 1);
        }

        let arrDifficulty = []
        this.state.data.forEach((element) => {
            arrDifficulty.push(element.difficulty)
        })

        let easyArr = [];
        let searchElement = 'easy';
        let idx = arrDifficulty.indexOf(searchElement);
        while (idx !== -1) {
            easyArr.push(idx + 1);
            idx = arrDifficulty.indexOf(searchElement, idx + 1);
        }
        let easyArrContainer = easyArr.map((element) => {
            return <p className="question" key={element} style={{textAlign: "center", borderRadius: "5px 0 0 5px" }} data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={()=>this.setState({modal_id: element})}>{element}</p>
        })
        let easyAnswerContainer = easyArr.map((element) => {

            if (truth.includes(element)) {
                return <p key={element} style={{background: "#2e7d32", textAlign: "center", borderRadius: "0 5px 5px 0"}}>True</p>
            }else{
                return <p key={element} style={{background: "#5E2129", textAlign: "center", borderRadius: "0 5px 5px 0"}}>False</p>
            }
        })

        let mediumArr = [];
        let searchElement2 = 'medium';
        let idx2 = arrDifficulty.indexOf(searchElement2);
        while (idx2 !== -1) {
            mediumArr.push(idx2 + 1);
            idx2 = arrDifficulty.indexOf(searchElement2, idx2 + 1);
        }
        let mediumArrContainer = mediumArr.map((element) => {
            return <p className="question" key={element} style={{textAlign: "center", borderRadius: "5px 0 0 5px"}} data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={()=>this.setState({modal_id: element})}>{element}</p>
        })
        let mediumAnswerContainer = mediumArr.map((element) => {
            if (truth.includes(element)) {
                return <p key={element} style={{background: "#2e7d32", textAlign: "center", borderRadius: "0 5px 5px 0"}}>True</p>
            }else{
                return <p key={element} style={{background: "#5E2129", textAlign: "center", borderRadius: "0 5px 5px 0"}}>False</p>
            }
        })

        let hardArr = [];
        let searchElement3 = 'hard';
        let idx3 = arrDifficulty.indexOf(searchElement3);
        while (idx3 !== -1) {
            hardArr.push(idx3 + 1);
            idx3 = arrDifficulty.indexOf(searchElement3, idx3 + 1);
        }
        let hardArrContainer = hardArr.map((element) => {
            return <p className="question" key={element} style={{textAlign: "center", borderRadius: "5px 0 0 5px"}} data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={()=>this.setState({modal_id: element})}>{element}</p>

        })
        let hardAnswerContainer = hardArr.map((element) => {
            if (truth.includes(element)) {
                return <p key={element} style={{background: "#2e7d32", textAlign: "center", borderRadius: "0 5px 5px 0"}}>True</p>
            }else{
                return <p key={element} style={{background: "#5E2129", textAlign: "center", borderRadius: "0 5px 5px 0"}}>False</p>
            }
        })
        this.setState( {
            easy: easyArrContainer,
            medium: mediumArrContainer,
            hard: hardArrContainer,
            easyAnswerContainer: easyAnswerContainer,
            mediumAnswerContainer: mediumAnswerContainer,
            hardAnswerContainer: hardAnswerContainer,

        })
    }


    amountHandler = (e) => {
        this.setState({amount_of_questions: e.target.value})
    };
    categoryHandler = (e) => {
        this.setState({category: e.target.value})
    };
    render() {

        if (this.state.menu === true) {
            return(
                <div className="App">
                    <div className="decoration1 rounded" key={this.state.index}/>
                    <div className="decoration2 rounded"/>
                    <div className="decoration3 rounded"/>
                    <div className="decoration8 rounded"/>
                    <div className="decoration9 rounded"/>
                    <header className="App-header">
                        <div className="text title container my-5 shadow p  rounded">
                            <div className="text d-flex justify-content-center p-3">Mini-Trivia</div>
                        </div>
                        <div className="container mb-5 pb-3">
                            <div className="row">
                                <div className="col-6 ">
                                    <label className="text d-flex justify-content-center mb-2">Category</label>
                                    <select className="form-select btn-secondary shadow p p-3 rounded " onChange={this.categoryHandler} aria-label="Default select example">
                                        <option value="">Any Category</option>
                                        <option value="&category=9">General Knowledge</option>
                                        <option value="&category=27">Animals</option>
                                        <option value="&category=23">History</option>
                                        <option value="&category=30">Science: Gadgets</option>
                                        <option value="&category=22">Geography</option>
                                        <option value="&category=11">Films</option>
                                        <option value="&category=12">Music</option>
                                        <option value="&category=15">Video Games</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="text d-flex justify-content-center mb-2">Questions</label>
                                    <select className="form-select btn-secondary shadow p p-3 rounded " onChange={this.amountHandler} aria-label="Default select example">
                                        <option defaultValue="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="text start d-flex justify-content-center d-flex align-items-center p-2" onClick={()=>{
                                    bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"})
                                    this.fetchHandler();
                                }}><div>Start</div></div>
                            </div>
                        </div>
                    </header>
                </div>
            );
        }

        if (this.state.isFetching) {
            return <div className="App">
                <header className="text App-header">...Loading</header>
            </div>;
        }
        if (this.state.error) return <div>{`Ошибка: ${this.state.error.message}`}</div>;

        if (this.state.count_result === true) {
            return <div>
                <div className="modal fade"  role="dialog" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" style={{paddingLeft: "20px", paddingRight: "20px"}} role="document">
                        <div className="modal-content" >
                            <div className="modal-body">
                                <p>{this.state.data[this.state.modal_id-1].category}</p>
                                <p>{this.state.data[this.state.modal_id-1].question}</p>
                                <p>Correct answer: {this.state.data[this.state.modal_id-1].correct_answer}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="App">
                    <div className="decoration10 rounded"/>
                    <div className="decoration11 rounded"/>
                    <header className="App-header">
                        <div className="wrapper container ">
                            <div className="row p-2 result">
                                <h1 className="text pt-5">Results</h1>
                            </div>
                            <div className="row shadow p p-2 rounded my-3 mx-2" style={{background:"#263238"}}>
                                <strong className="mb-2">Easy</strong>
                                <div className="col-6">{this.state.easy}</div>
                                <div className="col-6">{this.state.easyAnswerContainer}</div>
                            </div>
                            <div className="row shadow p p-2 rounded my-3 mx-2" style={{background:"#263238"}}>
                                <strong className="mb-2">Medium</strong>
                                <div className="col-6">{this.state.medium}</div>
                                <div className="col-6">{this.state.mediumAnswerContainer}</div>
                            </div>
                            <div className="row shadow p p-2 rounded my-3 mx-2" style={{background:"#263238"}}>
                                <strong className="mb-2">Hard</strong>
                                <div className="col-6">{this.state.hard}</div>
                                <div className="col-6">{this.state.hardAnswerContainer}</div>
                            </div>

                            <div className="row justify-content-center" style={{margin: "5vh"}}>
                                <div className="text start d-flex justify-content-center d-flex align-items-center" onClick={()=> {
                                    bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"})
                                    this.setState({
                                    menu: true,
                                    category: "",
                                    amount_of_questions: 10,
                                    index: 0,
                                    count_result: false,
                                    buttonNext: <div className="text next d-flex justify-content-center d-flex align-items-center p-2" onClick={()=> {
                                            bridge.send("VKWebAppTapticImpactOccurred", {"style": "heavy"})
                                            this.handlerNext()
                                            }}><div>Next</div></div>,
                                    isFetching: true,
                                    answers_result: [],
                                    result: [],
                                    easy: [],
                                    medium: [],
                                    hard: [],
                                    easyAnswerContainer: [],
                                    mediumAnswerContainer: [],
                                    hardAnswerContainer: [],
                                })}}><div>Menu</div></div>
                            </div>

                        </div>
                    </header>
                </div>
            </div>
        }else{
            return (
                <div className="App" >
                    <div className="decoration4 rounded"/>
                    <div className="decoration5 rounded"/>
                    <div className="decoration6 rounded"/>
                    <div className="decoration7 rounded"/>
                    <header className="App-header p-3">
                        <div className="container">
                            <div className="row mb-3 shadow p p-3 rounded mb-3" style={{background:"#263238"}}>
                                <div className="col-6 wrapper_question"><strong>Category: </strong><br/>{this.state.question_data.category}</div>
                                <div className="col-6 wrapper_question"><strong>Difficulty: </strong><br/>{this.state.question_data.difficulty}</div>
                            </div>
                            <div className="row mb-3 shadow p p-3 rounded mb-3" style={{background:"#263238"}}>
                                <div className="col-12 wrapper_question">{this.state.question_data.question}</div>
                            </div>
                        </div>
                        <div className="container ">
                            <div className="row shadow p p-3 rounded" style={{background:"#263238"}}>
                                {this.state.answers}
                            </div>

                            <div className="row justify-content-center" style={{marginTop: "5vh"}}>
                                {this.state.buttonNext}
                            </div>
                        </div>
                    </header>
                </div>
            )
        }
    }
}





