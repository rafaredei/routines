import { StatusBar } from 'expo-status-bar';
import {AntDesign} from '@expo/vector-icons';
import {Feather} from '@expo/vector-icons';
import {Entypo} from '@expo/vector-icons';
import React, {useState, useEffect} from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Modal} from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { Easing } from 'react-native';
import countdown from "./assets/countdown.mp3"
import finish from "./assets/finish.mp3"
import go from "./assets/go.mp3"
import halfway from "./assets/halfway.mp3"
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';


let routineList = [
  { id: '0', text: 'satoru gojo', timers: [{timerID: '0', name: "get ready", duration: "00:10"}], completions: 0 },
];

const App = () => {
  
  const [isEditPageVisible, setIsEditPageVisible] = useState(false); //handles bringing up edit page
  const [isPlayPageVisible, setIsPlayPageVisible] = useState(false);
  const [isCompletePageVisible, setIsCompletePageVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null); //handles selected routines
  const [selectedTimer, setSelectedTimer] = useState(null); //handles selected timer
  const [name, setName] = useState(" ");
  const [routineListState, setRoutineListState] = useState(routineList);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [key, setKey] = useState(0)
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isHalfway, setIsHalfway] = useState(false);
  const [isOneSecond, setIsOneSecond] = useState(false);
  const [isTwoSecond, setIsTwoSecond] = useState(false);
  const [isThreeSecond, setIsThreeSecond] = useState(false);

  useEffect(() => {
    // Load routines from AsyncStorage when the app starts
    loadRoutines();
  }, []);

  useEffect(() => {
    // Save routines to AsyncStorage whenever routineListState changes
    saveRoutines();
  }, [routineListState]);

  const loadRoutines = async () => {
    try {
      const storedRoutines = await AsyncStorage.getItem('routines');
      if (storedRoutines) {
        const parsedRoutines = JSON.parse(storedRoutines);
        routineList = parsedRoutines;
        setRoutineListState({...parsedRoutines});
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const saveRoutines = async () => {
    try {
      const serializedRoutines = JSON.stringify(routineList);
      await AsyncStorage.setItem('routines', serializedRoutines);
    } catch (error) {
      console.error('Error saving routines:', error);
    }
  };
   
  const addRoutine = () => { //adds new routines
    setIsEditPageVisible(true);
    const newRoutine = { id: `${routineList.length}`, text: "new routine", timers: [{timerID: '0', name: "get ready", duration: "00:10"}], completions: 0 };
    routineList.push(newRoutine);
    setRoutineListState[[...routineList]]
    setSelectedRoutine(newRoutine);
  }

  const routinePress = (item) => {
   setSelectedRoutine(item)
  };
 
  const deleteRoutine = (index) => {
    routineList.splice(index, 1); //remove selected routine from list
    for (let i = index; i < routineList.length; i++) { //decrement all id's by 1 that come after deleted routine
        routineList[i].id--;
    }
    setSelectedRoutine(null);
    setIsEditPageVisible(false);
    setRoutineListState(routineList);
  }

  const renameRoutine = (newName) => {
    if (selectedRoutine) {
      timers = selectedRoutine.timers;
      selectedRoutine.text = newName; //updates selected routine and list itself
      setSelectedRoutine({ ...selectedRoutine });
      index = selectedRoutine.id;
      routineList[index].text = newName;
      routineList[index].timers = timers;
      setRoutineListState({...routineList});
    }
  }

  const renameTimer = (newName, item) => {
    routineIndex = selectedRoutine.id;
    timerIndex = item.timerID;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers[timerIndex].name = newName
    setRoutineListState(updatedRoutineList)
  }

  const chooseDuration = (newDuration, item) => {
    routineIndex = selectedRoutine.id;
    timerIndex = item.timerID;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers[timerIndex].duration = newDuration
    setRoutineListState(updatedRoutineList)
  }

  const deleteTimer = (item) => {
    if (selectedRoutine.timers.length > 1) {
      routineIndex = selectedRoutine.id;
      timerIndex = item.timerID;
      const updatedRoutineList = [...routineList]
      updatedRoutineList[routineIndex].timers.splice(timerIndex, 1)
      for (let i = timerIndex; i < updatedRoutineList[routineIndex].timers.length; i++) { //decrement all id's by 1 that come after deleted routine
        updatedRoutineList[routineIndex].timers[i].timerID--;
      }
      setRoutineListState(updatedRoutineList)
    }
  }

  const copyTimer = (item) => {
    const newTimer = {timerID: `${selectedRoutine.timers.length}`, name: item.name, duration: item.duration};
    routineIndex = selectedRoutine.id;
    const updatedRoutineList = [...routineList]
    updatedRoutineList[routineIndex].timers.push(newTimer)
    setRoutineListState(updatedRoutineList)
  }

  const playRoutine = () => {
    playGoSound()
    setIsPlayPageVisible(true)
    setCurrentTimerIndex(0)
    setTimerRunning(true)
    setKey(0)
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }

  const playFinishSound = async () => {
    const finishSound = new Audio.Sound()
    await finishSound.loadAsync(require('./assets/finish.mp3'));
    await finishSound.playAsync();
  }

  const playCountdownSound = async () => {
    const countdownSound = new Audio.Sound()
    await countdownSound.loadAsync(require('./assets/countdown.mp3'));
    await countdownSound.playAsync();
  } 

  const playHalfwaySound = async () => {
    const halfwaySound = new Audio.Sound()
    await halfwaySound.loadAsync(require('./assets/halfway.mp3'));
    await halfwaySound.playAsync();
  } 

  const playGoSound = async () => {
    const goSound = new Audio.Sound()
    await goSound.loadAsync(require('./assets/go.mp3'));
    await goSound.playAsync();
  } 
  
  const children = ({ remainingTime }) => { //format remaining time
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    if (remainingTime === Math.ceil((convert(selectedRoutine.timers[currentTimerIndex].duration) / 2)) && (!isHalfway) && (convert(selectedRoutine.timers[currentTimerIndex].duration) > 9)) {
      playHalfwaySound();
      setIsHalfway(true)
    }
    if (remainingTime === 3 && !isThreeSecond) {
      playCountdownSound()
      setIsThreeSecond(true)
    }
    if (remainingTime === 2 && !isTwoSecond) {
      playCountdownSound()
      setIsTwoSecond(true)
    }
    if (remainingTime === 1 && !isOneSecond) {
      playCountdownSound()
      setIsOneSecond(true)
    }

    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{`${formattedMinutes}:${formattedSeconds}`}</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>Remaining</Text>
      </View>
    );
  };

  const onComplete = () => {
    if (selectedRoutine.timers[currentTimerIndex + 1]) {
      playGoSound()
      setCurrentTimerIndex(currentTimerIndex + 1)
      setTimerRunning(true)
      setKey(key + 1) //makes the timer properly reset for some reason
    } else {
      setIsCompletePageVisible(true)
      playFinishSound()
      setTimerRunning(false)
      setIsPlayPageVisible(false)
      setCurrentTimerIndex(0)
      selectedRoutine.completions++
      setKey(0) //ends timer i think??
    }
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }

  const checkTimer = () => {
    let flag = true
    if (selectedRoutine.timers.length === 0) {
      flag = false;
    }
    for (let i = 0; i < selectedRoutine.timers.length; i++) {
      const timer = selectedRoutine.timers[i];
      if (/^[0-9]:[0-5][0-9]$/.test(timer.duration)) {
        chooseDuration("0" + timer.duration, timer)
      }
      if (timer.name.length <= 0 || !(/^[0-5][0-9]:[0-5][0-9]$/.test(timer.duration)) || timer.duration == "00:00") {
        flag = false
      }
    }
    if (flag) {
      setIsEditPageVisible(false);
    }
  };

  const convert = (duration) => {
    const [minutes, seconds] = duration.split(':');
    const total = (parseInt(minutes) * 60) + parseInt(seconds);
    return total;
  }

  const pauseTimer = () => {
    setIsTimerPaused(!isTimerPaused)
    setTimerRunning(!timerRunning)
  }

  const skipBack = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    if (currentTimerIndex === 0) {
      setKey(key - 1)
    } else {
      setCurrentTimerIndex(currentTimerIndex - 1)
      setTimerRunning(true)
      setKey(key - 1)
    }
    setIsHalfway(false)
    setIsOneSecond(false)
    setIsTwoSecond(false)
    setIsThreeSecond(false)
  }

  const skipForward = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    onComplete()
  }

  const cancelRoutine = () => {
    if (isTimerPaused) {
      setIsTimerPaused(!isTimerPaused)
      setTimerRunning(!timerRunning)
    }
    setTimerRunning(false)
    setIsPlayPageVisible(false)
    setCurrentTimerIndex(0)
  }

  return (
    //play button and selected routine
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <TouchableOpacity
        onPress={() => {
            if (selectedRoutine !== null) {
              playRoutine();
            }
          }} 
          activeOpacity={selectedRoutine !== null ? 0.5 : 1}
          >
        <AntDesign name='play' size={200}/>
      </TouchableOpacity>

      <Modal
      visible={isCompletePageVisible}
      onRequestClose={() => setIsCompletePageVisible(false)}
      presentationStyle='fullscreen'
      >
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <Text>Well done! You've completed this routine {selectedRoutine ? selectedRoutine.completions : 0} {selectedRoutine && selectedRoutine.completions === 1 ? "time" : "times" }</Text>
          <TouchableOpacity onPress={() => setIsCompletePageVisible(false)}>
            <AntDesign name='check' size={30}/>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
      visible={isPlayPageVisible}
      onRequestClose={() => setIsPlayPageVisible(false)}
      presentationStyle='fullscreen'
      >
        <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 500, paddingRight: 300}}>
          <TouchableOpacity onPress={() => cancelRoutine()} style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15}}>cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, justifyContent: 'center', bottom: 500}}>
          <Text style={{fontWeight: 'bold', fontSize: 25, paddingBottom: 0, textAlign: 'center'}}>
            {selectedRoutine && selectedRoutine.timers[currentTimerIndex] ?
              selectedRoutine.timers[currentTimerIndex].name :
              "Fallback Text"}
          </Text>
        </View>

        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', bottom: 320}}>
          <CountdownCircleTimer
            key={key}
            isPlaying={timerRunning}
            duration={isPlayPageVisible ? convert(selectedRoutine.timers[currentTimerIndex].duration) : 0}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[7, 5, 2, 0]}
            size={300}  
            onComplete={() => onComplete()}
          >
            {children}
          </CountdownCircleTimer>
        </View>

        <View style={{flex: 1, alignItems: 'center', bottom: 150}}>
          <Text style={{fontSize: 20}}>{selectedRoutine && selectedRoutine.timers[currentTimerIndex + 1] ? "up next:" : "final interval"}</Text>
          <Text style={{fontSize: 25, textAlign: 'center'}}>{selectedRoutine && selectedRoutine.timers[currentTimerIndex + 1] ? selectedRoutine.timers[currentTimerIndex + 1].name : ""}</Text>
        </View>

        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', bottom: 100}}>
          <View style={{paddingRight: 90, paddingTop: 10}}>
            <TouchableOpacity
              onPress={() => {
                skipBack()
              }} 
              activeOpacity={.8}
            >
              <AntDesign name='stepbackward' size={30}/>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              pauseTimer()
            }} 
            activeOpacity={.8}
          >
            {isTimerPaused ? (
              <Entypo name='controller-play' size={50}/>
            ) : (
              <AntDesign name='pause' size={50}/>
            )}
          </TouchableOpacity>

          <View style={{paddingLeft: 90, paddingTop: 10}}>
            <TouchableOpacity
              onPress={() => {
                if (selectedRoutine !== null) {
                  skipForward();
                }
              }} 
              activeOpacity={.8}
            >
              <AntDesign name='stepforward' size={30}/>
            </TouchableOpacity>
          </View>
        </View>

      </Modal>

      <TextTicker
        scrollSpeed={20}
        loop
        repeatSpacer={40}
        bounceDelay={1000}
        animationType='scroll'
        easing={Easing.linear}
      >
        <Text style={{fontSize: 40, paddingTop: 20, paddingBottom: 20, fontWeight: 'bold'}}>{selectedRoutine ? selectedRoutine.text : " "}</Text>
      </TextTicker>

      <FlatList //list of routines
        data={routineList}
        renderItem={({item}) => {
          return (
              <TouchableOpacity
                key={item.id}
                onPress={() => routinePress(item)}
                activeOpacity={1}
                style={{backgroundColor: item.id === selectedRoutine?.id ? 'lightblue' : 'white'}}
              >
              <TextTicker
                scrollSpeed={20}
                loop
                repeatSpacer={40}
                bounceDelay={1000}
                animationType='scroll'
                easing={Easing.linear}
              >
                <Text style={{alignItems: 'center', fontSize: 30}}>{item.text}</Text>
              </TextTicker>
              </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>Tap the "+" to create a new routine!</Text>}
        style={{height: 400, width: 300, maxHeight: 400, maxWidth: 300, borderColor: 'black', borderWidth: 2}}
      />

      <View style={{flexDirection: 'row'}}> 
        <TouchableOpacity
        onPress={() => {
          if (selectedRoutine !== null) {
            setIsEditPageVisible(true);
          }
        }} 
        activeOpacity={selectedRoutine !== null ? 0.5 : 1}
        style={{marginRight: 200}}
        >
          <Text style={{fontSize: 30, color: selectedRoutine ? 'black' : 'gray'}}>edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => addRoutine()}>
          <Text style={{fontSize:30}}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal
      visible={isEditPageVisible}
      onRequestClose={() => setIsEditPageVisible(false)}
      animationType='slide'
      presentationStyle='fullscreen'
      >
        <View style={{alignItems: 'center', flex: 1, padding:50}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => deleteRoutine(selectedRoutine.id)}>
              <Feather name='trash' size={25}/>
            </TouchableOpacity>

            <View>
              <TextInput style={{height: 50, width: 300, fontSize: 25, textAlign: 'center', fontWeight: 'bold'}}
                value={selectedRoutine ? selectedRoutine.text : " "}
                //maxLength={21}
                onChangeText={(newName) => renameRoutine(newName)}
              />
              <View style={{paddingTop: 0}}>
                {selectedRoutine && (
                  <FlatList //list of timers
                  data={selectedRoutine.timers}
                  renderItem={({item}) => {
                    return (
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'cyan', padding: 5}}>
                        <View>
                          <TextInput style={{fontSize: 20, textAlign: 'left', fontWeight: 'bold', overflow: 'hidden'}}
                            value={item.name}
                            multiline
                            maxLength={28}
                            onChangeText={(newName) => renameTimer(newName, item)}
                          />
                          <TextInput style={{fontSize: 30, textAlign: 'left', fontWeight: 'bold'}}
                            value={item.duration}
                            maxLength={5}
                            placeholder='01:30'
                            onChangeText={(duration) => chooseDuration(duration, item)}
                          />
                        </View>
                        <View>
                          <TouchableOpacity onPress={() => deleteTimer(item)}>
                            <Text style={{fontSize: 30}}>-</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => copyTimer(item)}>
                            <Text style={{fontSize: 30}}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                    ListEmptyComponent={<Text>Tap the "+" to create add a timer!</Text>}
                    style={{height: 700, width: 300, maxHeight: 1000, maxWidth: 400, borderColor: 'black', borderWidth: 2}}
                  />
                )}  
              </View>
            </View>
            <View>
              <TouchableOpacity onPress={() => checkTimer()}>
                <AntDesign name='check' size={30}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};



export default App;
