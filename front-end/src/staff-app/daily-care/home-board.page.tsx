import React, { useState, useEffect,useRef} from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

import orderBy from "lodash/orderBy"
import { RolllStateType } from "shared/models/roll"
import {add,get,LocalStorageKey} from "shared/helpers/local-storage"
import { faAngleDown } from "@fortawesome/free-solid-svg-icons"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)

  const [filtered,setFiltered]=useState<boolean>(false)
  const [sortArray, setSortArray] = useState<Person[]>()
  const [sortOrder, setSortOrder] = useState("")
  const [click, setClick] = useState(0)
  const [isSort, setIsSort] = useState(false)
  const [nameSortType, setNameSortType] = useState("first")

  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  const searchHandle = (value: string) => {
    if(value!=="" && value.length >0){
      if (value && value.length > 0) {
        if (sortArray && sortArray.length) {
          setSortArray(sortArray.filter((s) => s.first_name.toLowerCase().match(value.toLowerCase())))
        }
      }
    }else{
      setSortArray(data?.students)
    }
    
  }

  let sdata = data?.students
  console.log(sdata)
  useEffect(() => {
    void getStudents()
    // console.log(void getStudents())
    // console.log(data?.students)
  }, [getStudents])
  // useEffect(() => {
  //   if(loadState==="unloaded"){
  //     setSortArray(sdata)
  //     console.log('sdata')
  //   }
  // }, [data])
  function sortasc(){
    let arr = data?.students.map((s) => {
      return s
    })
    let sorted_arr = orderBy(arr, ["first_name"], ["asc"])
    console.log("asace array", sorted_arr)
    setSortArray(sorted_arr)
  }
  useEffect(()=>{
    if(sortArray!== undefined){
      if(sortOrder==="asc"){
        if(nameSortType==="first"){
          const sortedList= orderBy(sortArray, ["first_name"], ["asc"])
            setSortArray(sortedList)
        }else{
          const sortedList= orderBy(sortArray,["last_name"],["asc"])
          setSortArray(sortedList)
        }
      }else if(sortOrder==="desc"){
        if(nameSortType==="first"){
          const sortedList = orderBy(sortArray,["first_name"],["desc"])
          setSortArray(sortedList)
        }else{
          const sortedList=orderBy(sortArray,["last_name"],["desc"])
          setSortArray(sortedList)
        }
      }
    }
  },[sortOrder,nameSortType])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    if (action === "sort") {
      setIsSort(true)

      let clickCount = click + 1

      setClick(clickCount)
      console.log(click)
      if (click % 2 === 0) {
        setSortOrder("asc")
      
        // return sortArray
      } else {
        setSortOrder("desc")
       
      }
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    } 
  }
  const inititalRollCount={
    presentCount:0,
    absentCount:0,
    lateCount:0,
  }
  const [rollCount,setRollCount]=useState<RollCount>(inititalRollCount)

  let stateList: StateList[]=[

    { type: "all", count: rollCount.presentCount + rollCount.absentCount + rollCount.lateCount },
    { type: "present", count: rollCount.presentCount },
    { type: "late", count: rollCount.lateCount },
    { type: "absent", count: rollCount.absentCount },
  ]
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} searchHandle={searchHandle} click={click} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && sortArray
          ? sortArray.map((s)=>(
            <StudentListTile key={s.id} isRollMode={isRollMode} student={s} rollCount={rollCount}setRollCount={setRollCount}/>
          ))
          : loadState === "loaded" &&
            data?.students && (
              <>
             {setSortArray(data.students)}
                {console.log("issorted?", sortArray)}
                {data?.students?.map((s) => (
            <StudentListTile key={s.id} isRollMode={isRollMode} student={s} rollCount={rollCount}setRollCount={setRollCount}/>
            ))}

                {console.log(!isSort)}
              </>
            )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={stateList}/>
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  searchHandle: (value: string) => void
  click:number
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, searchHandle,click } = props
  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>{click%2==1?"First Name":"Last Name"}</div>
      {/* <div onClick={() => onItemClick(Click)}>first Name</div> */}
      <S.ToggleButton onClick={() => onItemClick("sort")}>
          <FontAwesomeIcon icon={faAngleDown} />
        </S.ToggleButton>
      <input
        type="text"
        placeholder="Search"
        onChange={(event) => {
          searchHandle(event.target.value)
        }}
      />
      {/* <div>Search</div> */}
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
   ToggleButton: styled.button`
   width: 1rem;
   height: 1rem;
   margin-left: 0.2rem !important;
   position: relative;
   background-color: ${Colors.blue.base};
   border: none;
   border-radius: 4px;
   transition: all 0.2s ease;

   &.desc {

     &:hover {
       background-color: ${Colors.blue.base};
     }
     & .fa-angle-down {
       transform: rotate(180deg);
     }
   }
 `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
interface RollCount {
  presentCount: number
  absentCount: number
  lateCount: number
}

interface StateList {
  type: ItemType
  count: number
}

type ItemType = RolllStateType | "all"