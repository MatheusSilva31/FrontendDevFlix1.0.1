import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Dimensions, ImageBackground, TextInput, TouchableOpacity, Image, Alert, Button } from 'react-native';
import endPoints from './services/endpoints'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Carousel from 'react-native-snap-carousel';
import Modal from 'react-native-modal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
export default function App() {
  const [movies, setMovies] = useState([])
  const [auxMovies, setAuxMovies] = useState()
  const [images, setImages] = useState()
  const [updateScreen, setUpdateScreen] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalAppear, setModalAppear] = useState(false)
  const [inputTitulo, setInputTitulo] = useState("")
  const [inputUrl, setInputUrl] = useState("")
  const [inputSinopse, setInputSinopse] = useState("")
  const [inputFlag, setInputFlag] = useState("")
  const carroselRef = useRef(null)

  const [textSearch, setTextSearch] = useState('')

  //use effect fica monitorando caso o estado updateScreen mude ele atualiza a tela

  useEffect(() => {
    getMovies()

  }, [updateScreen])



  //funcção que traz todos os filmes
  async function getMovies() {
    await axios.get(`${endPoints.getMovies}`)
      .then((response) => {
        const data = response.data
        setImages(data.poster)
        setMovies(data)
        setAuxMovies(data)
        setUpdateScreen(1)
      })
      .catch((erro) => {
        console.log('deu erro', erro)
      })
  }
  //função que grava os filmes
  async function saveMovie() {
    const body = {
      "title": inputTitulo,
      "poster": inputUrl,
      "sinopse": inputSinopse,
      "isMovie": "true",
      "alreadyBeenWatched": inputFlag
    }
    await axios.post(`${endPoints.saveMovie}`, body)
      .then((response) => {
        setModalAppear(false)
        setUpdateScreen(4)
      }).catch((erro) => {
        console.log('deu ruim', erro)
      })
  }
  const _renderItem = ({ item, index }) => {
    //Funcção que atualiza o status do filme
    async function UpdateStatusMovie() {
      const body = {
        "title": item.title,
        "poster": item.poster,
        "sinopse": item.sinopse,
        "isMovie": "true",
        "alreadyBeenWatched": !item.alreadyBeenWatched

      }
      await axios.patch(`${endPoints.updateMovie}/${item._id}`, body)
        .then((res) => {
          setUpdateScreen(2)
        }).catch((erro) => {
          console.log('deu ruim', erro)
        })
    }
    //traz a logica de rendenizar as imagens no carrosel
    return (
      <View>
        <TouchableOpacity onPress={() => { UpdateStatusMovie() }}>
          <Image
            source={{ uri: item.poster }}
            style={styles.carroselImg}
          ></Image>
          <Icon name='autorenew' color='#FFF' size={28} style={styles.posterIcons}></Icon>
        </TouchableOpacity>
      </View>
    )
  }

  useEffect(() => {
    if (textSearch === '') {
      setMovies(auxMovies)
    } else {
      setMovies(auxMovies.filter((item) =>
        item.title.toLowerCase().indexOf(textSearch.toLowerCase()) > -1
      ))
    }
  }, [textSearch])
  // useEffect(()=>{
  //   console.log(textSearch)
  //   let arr = JSON.parse(JSON.stringify(auxMovies));
  //   setMovies(arr.filter((textSearch)=>textSearch.title.includes(textSearch)))
  // },[textSearch])

  // function search(s){

  //   let arr = JSON.parse(JSON.stringify(auxMovies));
  //   setMovies(arr.filter((d)=>d.title.includes(s)))
  // }

  return (
    <ScrollView style={styles.container}>
      <View style={{ flex: 1, height: screenHeight }}>
        <View style={{ ...StyleSheet.absoluteFill, backgroundColor: '#000' }}>
          <ImageBackground
            source={{ uri: images ? images : 'https://i.ibb.co/vLVP4Fn/fall-movies-index-1628968089.jpg' }}
            style={styles.imgBackground}
            blurRadius={1}>
            <View style={styles.viewSearchInput}>
              <TextInput
                style={styles.input}
                placeholder='digite um nome'
                onChangeText={(s) => { setTextSearch(s) }}
              ></TextInput>
              <TouchableOpacity style={styles.inputButton}>
                <Icon name='search' color='#000' size={28}></Icon>
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#FFF', fontSize: 25, fontWeight: 'bold', alignSelf: 'center' }}>DevFlix</Text>
            <View style={styles.Viewcarrosel}>
              <Carousel
                style={styles.carrosel}
                ref={carroselRef}
                data={movies}
                renderItem={_renderItem}
                sliderWidth={screenWidth}
                itemWidth={200}
                inactiveSlideOpacity={0.5}
                onSnapToItem={(index) => {
                  setImages(movies[index].poster)
                  setActiveIndex(index)
                  
                }}
              ></Carousel>
            </View >
            <View style={styles.info}>
              <View style={{ marginTop: 10 }}>
                {movies == undefined || movies[activeIndex] === undefined ? <Text></Text> :
                  <>
                    <Text style={movies[activeIndex].alreadyBeenWatched ? styles.titleInfoWatched : styles.titleInfoNotWatched}>{movies ? movies[activeIndex].title : 'Seja Bem vindo ao DevFlix'}</Text>
                    <Text style={styles.sinopse}>{movies ? movies[activeIndex].sinopse : 'Desenvolvido por Matheus Santos '}</Text>
                  </>
                }



                {/* <Text style={movies[activeIndex].alreadyBeenWatched ? styles.titleInfoWatched : styles.titleInfoNotWatched}>{movies ? movies[activeIndex].title : 'Seja Bem vindo ao DevFlix'}</Text> */}
                {/* <Text style={styles.sinopse}>{movies ? movies[activeIndex].sinopse : 'Desenvolvido por Matheus Santos '}</Text> */}
              </View>
              <TouchableOpacity onPress={() => { setModalAppear(true) }} style={styles.addButton}>
                <Icon name='add' color='#000' size={30}></Icon>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <Modal onBackdropPress={() => setModalAppear(false)} isVisible={modalAppear}>
          <View style={styles.modalView}>
            <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', paddingTop: '5%', color: 'purple' }}>Cadastrar novo filme</Text>
            <View style={styles.viewInsideModal}>
              <TextInput style={styles.modalInput} placeholder="Nome do filme"
                onChangeText={titulo => setInputTitulo(titulo)}></TextInput>
              <TextInput style={styles.modalInput} placeholder="url poster"
                onChangeText={url => setInputUrl(url)}></TextInput>
              <TextInput style={styles.modalInput} placeholder="sinopse"
                onChangeText={sinopse => setInputSinopse(sinopse)}></TextInput>
              <TextInput style={styles.modalInput} placeholder="Já foi assitido ? true or false"
                onChangeText={flag => setInputFlag(flag)}></TextInput>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 5 }}>
              <Button title="Fechar" color="purple" onPress={() => { setModalAppear(false) }}></Button>
              <Button title="Salvar" color="purple" onPress={() => { saveMovie() }}></Button>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imgBackground: {
    flex: 1,
    width: null,
    height: null,
    opacity: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#000'
  },
  viewSearchInput: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginVertical: 10,
    width: '95%',
    flexDirection: 'row',
    alignSelf: 'center'

  },
  input: {
    width: '90%',
    padding: 13,
    paddingLeft: 20,
    fontSize: 18

  },
  inputButton: {
    position: 'absolute',
    right: 20,
    top: 15
  },
  Viewcarrosel: {
    width: '100%',
    height: 350,
    justifyContent: 'center',
    alignItems: 'center'
  },
  carrosel: {
    flex: 1,
    overflow: 'visible'
  },
  carroselImg: {
    alignSelf: 'center',
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)'

  },
  posterIcons: {
    position: 'absolute',
    top: 10,
    right: 15
  },
  info: {
    backgroundColor: '#FFF',
    width: screenWidth,
    height: screenHeight,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // flexDirection:'row',
    padding: 10,
    // justifyContent:'space-between'
  },

  titleInfoWatched: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#006400',
    textAlign: 'justify',
    fontSize: 20
  },
  titleInfoNotWatched: {
    color: '#DC143C',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'justify',
    fontSize: 20
  },
  sinopse: {
    textAlign: 'justify',
    fontSize: 12
  },


  addButton: {
    top: 8,
    alignSelf: 'center'
  },
  modalView: {
    backgroundColor: '#FFF',
    height: screenHeight / 2
  },
  viewInsideModal: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  modalInput: {
    width: '80%',
    padding: 10,
    paddingLeft: 10,
    fontSize: 15,
    borderColor: "grey",
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 5
  }
})