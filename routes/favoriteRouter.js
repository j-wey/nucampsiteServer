const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        if(favorites) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favorites)
        } else {
            console.log('No sites favorited!')
            err = new Error('No favorites found!')
            err.status = 404
            return next(err)
        }
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if(favorites) {
            req.body.forEach(campsite => {
                if (!favorites.campsites.includes(campsite._id)) {
                    favorites.campsites.push(campsite._id)
                }
            })
            favorites.save()
                    .then(fav => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(fav)
                    })
                    .catch(err => next(err))
        } else {
            console.log('no favorites')
            Favorite.create({user: req.user._id})
            .then(favorites => {
                req.body.forEach(campsite => favorites.campsites.push(campsite._id))
                favorites.save()
                console.log('Campsite Favorited ', favorites)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(favorites)
            })
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported!')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id})
    .then(response => {
        res.statusCode = 200
        if (response) {
            res.setHeader('Content-Type', 'application/json')
            res.json(response)
        } else {
            res.setHeader('Content-Type', 'text/plain')
            res.end('You do not have any favorites to delete')
        }
    })
    .catch(err => next(err))
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res, next) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('GET operation not supported!')
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorites => {
        if(favorites) {
            if (!favorites.campsites.includes(req.params.campsiteId)) {
                    favorites.campsites.push(req.params.campsiteId)
                    favorites.save()
                    .then(fav => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(fav)
                    })
                    .catch(err => next(err))
            } else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/plain')
                res.end('That campsite is already in the list of favorites!')
            }
        } else {
            Favorite.create({user: req.user._id})
            .then(favorites => {
                favorites.campsites.push(req.params.campsiteId)
                favorites.save()
                .then(fav => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(fav)
                })
                .catch(err => next(err))
            })
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported!')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if (favorites && favorites.campsites.length === 0) {
            res.statusCode = 200
                res.setHeader('Content-Type', 'text/plain')
                res.end('You have no favorites to delete!')
        }
        if (favorites) {
            const idx = favorites.campsites.indexOf(req.params.campsiteId)
            if(idx !== -1) {
                favorites.campsites.splice(idx, 1)
                favorites.save()
                .then(fav => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(fav)
                })
                .catch(err => next(err))
            } else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/plain')
                res.end('You have not favorited that site!')
            }
        } else {
            err = new Error('Favorites not found')
            err.status = 404
            return next(err)
        }
    })
    .catch(err => next(err))
})

module.exports = favoriteRouter