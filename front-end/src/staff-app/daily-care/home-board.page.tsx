import React, { useState, useEffect } from "react"
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

import orderBy from "lodash/orderBy";




export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)


  const [sortArray,setSortArray]=useState<Person[]>([])
  const [click,setClick]=useState(0)
  const [isSort,setIsSort]=useState(false)

  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })


  const searchHandle = (value: string) => {
    console.log("sorted array" ,sortArray.filter((s)=>s.first_name))
    if (value && value.length > 0) {
      if (sortArray && sortArray.length) {
        setSortArray(sortArray.filter((s) => s.first_name.concat(" ", s.last_name).toLowerCase().match(value.toLowerCase())))
      }
    }
  }


  useEffect(() => {
    void getStudents()
    // console.log(void getStudents())
    // console.log(data?.students)
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    if(action==='sort'){
      setIsSort(true)
      let clickCount=click+1;
      
     setClick(clickCount)
      console.log(click)
      if(click %2===0){

        let arr=data?.students.map((s)=>{
          return s
        })
        let sorted_arr= orderBy(arr,["first_name"],['desc'])
        console.log('asace array',sorted_arr)
        setSortArray(sorted_arr)
        // return sortArray
      }
      else{
        let arr=data?.students.map((s)=>{
          return s
        })
        let sorted_arr= orderBy(arr,["first_name"],['asc'])
        console.log('asace array',sorted_arr)
        setSortArray(sorted_arr)
        return sortArray
      }
    }
  
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} searchHandle={searchHandle}/>

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
          {console.log("issorted?",sortArray)}
            {sortArray?.map((s)=>(
                     <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />

            ))}

                {console.log(!isSort)}
            {!isSort && data.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" 
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  searchHandle:(value:string)=>void

}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  


  const { onItemClick,searchHandle } = props
  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>First name</div>
      {/* <div onClick={() => onItemClick(Click)}>first Name</div> */}
      <input type='text' placeholder="Search" onChange={(event)=>{searchHandle(event.target.value)}}/>
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
