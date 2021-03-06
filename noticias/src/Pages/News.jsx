import React from 'react';
import swal from 'sweetalert';
import { Link } from 'react-router-dom';

import Footer from '../App/Footer/Footer.jsx';
import Loader from '../App/Loader/Loader.jsx';
import ErrorPage from './ErrorPage.jsx';
import Header from '../App/Header/Header.jsx';
import MainController from '../NewControllers/main.controller';
import NewsController from '../NewControllers/news.controller.js';
import '../Styles/App/NewsDetail/News.scss';
import AvatarController from '../NewControllers/avatar.controller';

class NewsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            token: true,
            NewElement: false,
            isNewLiked: false,
            isNewDisliked: false,
            avatar: false,
            autor: '',
            id: this.props.match.params.id
        }

        this._MainController = new MainController();
        this.NewsController = new NewsController();
        this.AvatarController = new AvatarController();
    }

    async componentDidMount() {
        let tokenValidate = await this._MainController.tokenValidate();

        let userInfo = await this._MainController.Consulta('user', sessionStorage.getItem('__token'), 'GET');
        if (!tokenValidate) {
            this.setState({
                token: false,
            });

        }

        this.setState({
            token: true,
            user: userInfo.result.user,
            avatar: userInfo.result.avatar
        })

        //Extraemos la informacion de la noticia que tenemos
        const response = await this.NewsController.findNew(this.state.id);
        if (response) {
            //Buscamos si el usuario le ha dado like a la noticia
            this.setState({
                NewElement: response,
                isNewDisliked: response.dislikes.isUserLike,
                isNewLiked: response.likes.isUserLike,
                autor: response.userid.user
            });
        } else {
            swal({ text: 'No se encontro la noticia que busca' })
                .then(() => {
                    window.location.href = "/home";
                })
                .catch(err => {
                    swal({ text: 'Hubo un error' })
                    window.location.href = "/home";
                    console.error(err);
                })
        }

    }

    //Controllador de likes de una new enviar o quitar
    LikeController = async () => {
        const data = {
            id: this.state.id,
            isLiking: true,
            isDisliking: false
        }
        await this.NewsController.Liker(data)
            .then(res => {
                this.setState({
                    isNewLiked: res.isLiked,
                    isNewDisliked: res.isDisliked
                })
            })
            .catch(err => {
                console.error(err);
            })
    }

    //Controllador de likes de una new enviar o quitar
    DislikeController = async () => {
        const data = {
            id: this.state.id,
            isLiking: false,
            isDisliking: true
        }
        await this.NewsController.Liker(data)
            .then(res => {
                this.setState({
                    isNewLiked: res.isLiked,
                    isNewDisliked: res.isDisliked
                })
            })
            .catch(err => {
                console.error(err);
            })
    }

    //Convertidor de fechas 
    render() {
        const style = {
            backgroundImage: "url(" + this.state.Avatar + ")",
        }

        try {
            const imgStyle = {
                backgroundImage: `url('${this.state.NewElement.img}')`,
            }
            const loading = (
                <div className="loaderCenter">
                    <Loader />
                </div>
            );

            const Page = (
                <div className="container-fluid">
                    <div className="wrapper">
                        <Header userName={this.state.user} token={this.state.token} avatar={this.state.avatar} />
                        <div className="contenidoWrapper">
                            {
                                (() => {
                                    if (this.state.isNewLiked) {
                                        return <div className="likeDisliked">
                                            <div className="like" onClick={() => this.LikeController()}></div>
                                            <div className="dislikedNoActive IconConten" onClick={() => this.DislikeController()}></div>
                                        </div>
                                    } else if (this.state.isNewDisliked) {
                                        return <div className="likeDisliked">
                                            <div className="likeNoActive IconConten" onClick={() => this.LikeController()}></div>
                                            <div className="dislikedActive IconConten" onClick={() => this.DislikeController()}></div>
                                        </div>
                                    } else {
                                        return <div className="likeDisliked">
                                            <div className="likeNoActive IconConten" onClick={() => this.LikeController()}></div>
                                            <div className="dislikedNoActive IconConten" onClick={() => this.DislikeController()}></div>
                                        </div>
                                    }
                                })()
                            }
                            <div className="newTitle">
                                <h2>{this.state.NewElement.title}</h2>
                            </div>
                            <div className="newImagen" style={imgStyle}></div>
                            <div className="newData">
                                <label className="label">
                                    <span className="negrita">Fecha de creación:</span>
                                    {this._MainController.date(this.state.NewElement.create_date)}
                                </label>
                                <label className="label">
                                    <span className="negrita">Autor:</span>

                                    <Link className="Link buttonAction" to="/user/info/">
                                        <div className="Avatar" style={style}>
                                        </div>
                                        {this.state.autor}</Link>
                                </label>
                            </div>
                            <div className="newContenido" id="newContenido" style={{ textAlign: this.state.NewElement.aling }} dangerouslySetInnerHTML={{ __html: this.state.NewElement.content }}>
                            </div>

                        </div>
                        <Footer />
                    </div>
                </div>
            );

            if (this.state.token) {
                if (this.state.NewElement) {
                    return Page;
                } else {
                    return loading;
                }

            } else {
                swal({
                    text: 'No tienes permisos para estar en esta página',
                    button: 'Volver'
                }).then(value => {
                    sessionStorage.removeItem('userid');
                    this.setState({});
                    window.location.href = '/'
                })
                return <h1>Opps</h1>
            }

        } catch (error) {
            return <ErrorPage errorValue={error} value={true} />;
        }

    }
}

export default NewsPage;