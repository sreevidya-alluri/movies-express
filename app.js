const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
app.use(express.json())

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost.3000/ ')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorObjectToResponseObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId}`
  const movie = await db.get(getMoviesQuery)
  response.send(convertMovieObjectToResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES('${directorId}',${movieName},${leadActor})
  `
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieIdQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId}}`
  const movie = await db.get(getMovieIdQuery)
  response.send(convertMovieObjectToResponseObject(movie))
})

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieDetails = `
  UPDATE movie
  SET director_id='${directorId}',
  movie_name=${movieName},
  lead_actor=${leadActor}
  WHERE movie_id=${movieId}`
  await db.run(updateMovieDetails)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE * FROM movie WHERE movie_id=${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const {directorId, directorName} = request.body
  const getDirectorsListQuery = `
  SELECT * FROM director WHERE director_id=${directorId}`
  const directorsList = await db.get(getDirectorsListQuery)
  response.send(convertDirectorObjectToResponseObj(directorsList))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getMovieNamesFromBoth = `
  SELECT movie_name FROM movie WHERE director_id=${directorId}`
  const movieNames = await db.all(getMovieNamesFromBoth)
  response.send(
    movieNames.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})
module.exports = app
