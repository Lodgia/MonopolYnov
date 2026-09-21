function rollDice(){
    return Math.random()*6
}

interface desProps{
    ():[number,number]
}

export function des( props : desProps){
    let de1 = rollDice()
    let de2 = rollDice()
    return (
        <>
            <div className='absolute object-center' >
                Score dé 1 :{de1} /// Score dé 2 : {de2}
                Score total : {de1+de2}
            </div>
            
        </>
    )
}