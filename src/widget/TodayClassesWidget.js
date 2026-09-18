/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { FlexWidget, TextWidget, ListWidget } from 'react-native-android-widget';
import { colors } from '../theme';
import { formatAcademicDate, academicDateKey } from '../services/todayClasses';

const theme = colors.dark;

export function TodayClassesWidget({
  meetings = [],
  periodCode = '',
  hasEnrolledCourses = false,
  isLoggedIn = true,
  date = new Date(),
  widgetInfo,
}) {
  const isToday = academicDateKey(date) === academicDateKey(new Date());
  const headerDateStr = formatAcademicDate(date);
  const capitalizedDate = headerDateStr ? headerDateStr.charAt(0).toUpperCase() + headerDateStr.slice(1) : '';

  const displayedMeetings = meetings;

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: '#181513',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#2d2520',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <FlexWidget
          clickAction="PREV_DAY"
          style={{
            width: 28,
            height: 28,
            backgroundColor: '#26201b',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#3a3028',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text="‹"
            style={{
              fontSize: 16,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              marginTop: -2,
            }}
          />
        </FlexWidget>

        <FlexWidget
          clickAction={isToday ? undefined : 'RESET_DAY'}
          style={{
            flex: 1,
            width: 0,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}
        >
          <TextWidget
            text={isToday ? 'POMI • HOJE' : 'POMI • VOLTAR P/ HOJE ↺'}
            maxLines={1}
            truncate="END"
            style={{
              fontSize: 9,
              fontFamily: 'Outfit_800ExtraBold',
              color: theme.primary,
              letterSpacing: 0.5,
              textAlign: 'center',
              marginBottom: 1,
            }}
          />
          <TextWidget
            text={capitalizedDate}
            maxLines={2}
            truncate="END"
            style={{
              fontSize: 11,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              textAlign: 'center',
            }}
          />
        </FlexWidget>

        <FlexWidget
          clickAction="NEXT_DAY"
          style={{
            width: 28,
            height: 28,
            backgroundColor: '#26201b',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#3a3028',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text="›"
            style={{
              fontSize: 16,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              marginTop: -2,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Main Content Area */}
      {!isLoggedIn ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            backgroundColor: '#221c18',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#342922',
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text="Faça login no aplicativo"
            style={{
              fontSize: 12,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              marginBottom: 3,
            }}
          />
          <TextWidget
            text="Abra o POMI para sincronizar suas aulas."
            style={{
              fontSize: 10,
              fontFamily: 'Outfit_400Regular',
              color: '#a39488',
              textAlign: 'center',
            }}
          />
        </FlexWidget>
      ) : !hasEnrolledCourses ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            backgroundColor: '#221c18',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#342922',
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text="Nenhuma disciplina cursando"
            style={{
              fontSize: 12,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              marginBottom: 3,
            }}
          />
          <TextWidget
            text={
              periodCode
                ? `Você não possui disciplinas em ${periodCode}.`
                : 'Você não possui disciplinas matriculadas neste período.'
            }
            style={{
              fontSize: 10,
              fontFamily: 'Outfit_400Regular',
              color: '#a39488',
              textAlign: 'center',
            }}
          />
        </FlexWidget>
      ) : displayedMeetings.length === 0 ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            backgroundColor: '#221c18',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: '#342922',
            padding: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <TextWidget
            text="Sem aulas nesta data"
            style={{
              fontSize: 12,
              fontFamily: 'Outfit_700Bold',
              color: '#f7f3ed',
              marginBottom: 3,
            }}
          />
          <TextWidget
            text="Aproveite o tempo livre para estudar ou descansar."
            style={{
              fontSize: 10,
              fontFamily: 'Outfit_400Regular',
              color: '#a39488',
              textAlign: 'center',
            }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <ListWidget
            style={{
              width: 'match_parent',
              height: 'match_parent',
            }}
          >
          {displayedMeetings.map((item, index) => {
            const status = item.status;
            
            // Status styling tokens
            let statusBadgeBg = '#27201b';
            let statusBadgeBorder = '#3d3129';
            let statusBadgeText = '#a89b91';
            let statusText = 'Mais tarde';

            if (status === 'now') {
              statusBadgeBg = '#3b1818';
              statusBadgeBorder = '#d56565';
              statusBadgeText = '#ff8282';
              statusText = 'Agora';
            } else if (status === 'next') {
              statusBadgeBg = '#35251c';
              statusBadgeBorder = '#b86638';
              statusBadgeText = '#e59c74';
              statusText = 'Próxima';
            } else if (status === 'finished') {
              statusBadgeBg = '#1c1714';
              statusBadgeBorder = '#2a221d';
              statusBadgeText = '#6e625a';
              statusText = 'Encerrada';
            }

            return (
              <FlexWidget
                key={item.id}
                clickAction={item.absenceId ? "DESFAZER_FALTA" : "MARCAR_FALTA"}
                clickActionData={
                  item.absenceId
                    ? { studentId: item.studentId, absenceId: item.absenceId }
                    : {
                        studentId: item.studentId,
                        courseAttemptId: item.courseAttemptId,
                        classScheduleId: item.classScheduleId,
                        date: item.occurrenceDate,
                      }
                }
                style={{
                  width: 'match_parent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#221c18',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: status === 'now' ? '#5a2d2a' : '#332922',
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  marginBottom: index === displayedMeetings.length - 1 ? 0 : 6,
                }}
              >
                {/* Left Column: Schedule & Course Information */}
                <FlexWidget
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    width: 0,
                    marginRight: 5,
                  }}
                >
                  {/* Time & Room Row */}
                  <FlexWidget
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <TextWidget
                      text={`${item.start.replace(':00', 'h')} – ${item.end.replace(':00', 'h')}`}
                      style={{
                        fontSize: 10,
                        fontFamily: 'Outfit_800ExtraBold',
                        color: '#f7f3ed',
                        marginRight: 4,
                      }}
                    />
                    <TextWidget
                      text={`•  ${item.roomCode || 'Sem sala'}`}
                      maxLines={1}
                      truncate="END"
                      style={{
                        fontSize: 9,
                        fontFamily: 'Outfit_500Medium',
                        color: '#9e9084',
                      }}
                    />
                  </FlexWidget>

                  {/* Course Name */}
                  <TextWidget
                    text={
                      item.courseName
                        ? `${item.courseCode} · ${item.courseName}`
                        : item.courseCode
                    }
                    maxLines={2}
                    truncate="END"
                    style={{
                      fontSize: 10.5,
                      fontFamily: 'Outfit_700Bold',
                      color: '#f7f3ed',
                    }}
                  />

                  {/* Professor */}
                  {item.professors ? (
                    <TextWidget
                      text={item.professors}
                      maxLines={1}
                      truncate="END"
                      style={{
                        fontSize: 9,
                        fontFamily: 'Outfit_400Regular',
                        color: '#8c7e73',
                        marginTop: 1,
                      }}
                    />
                  ) : null}
                </FlexWidget>

                {/* Right Column: Status Badge & Action Button */}
                <FlexWidget
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Status Badge */}
                  <FlexWidget
                    style={{
                      backgroundColor: statusBadgeBg,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: statusBadgeBorder,
                      paddingVertical: 1.5,
                      paddingHorizontal: 4,
                      marginBottom: 6,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TextWidget
                      text={statusText}
                      style={{
                        fontSize: 8,
                        fontFamily: 'Outfit_700Bold',
                        color: statusBadgeText,
                        textAlign: 'center',
                      }}
                    />
                  </FlexWidget>

                  {/* Absence Action Button */}
                  {item.absenceId ? (
                    <FlexWidget
                      style={{
                        paddingHorizontal: 6,
                        height: 22,
                        backgroundColor: '#d56565',
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TextWidget
                        text="Falta ✓"
                        style={{
                          fontSize: 9,
                          fontFamily: 'Outfit_700Bold',
                          color: '#ffffff',
                          textAlign: 'center',
                        }}
                      />
                    </FlexWidget>
                  ) : (
                    <FlexWidget
                      style={{
                        paddingHorizontal: 6,
                        height: 22,
                        backgroundColor: '#28211c',
                        borderWidth: 1,
                        borderColor: '#4d3d33',
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TextWidget
                        text="+ Falta"
                        style={{
                          fontSize: 9,
                          fontFamily: 'Outfit_700Bold',
                          color: '#d56565',
                          textAlign: 'center',
                        }}
                      />
                    </FlexWidget>
                  )}
                </FlexWidget>
              </FlexWidget>
            );
          })}

          </ListWidget>

          {/* {remainingCount > 0 ? (
            <FlexWidget
              style={{
                width: 'match_parent',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              <TextWidget
                text={`+${remainingCount} outra(s) aula(s) hoje`}
                style={{
                  fontSize: 9,
                  fontFamily: 'Outfit_600SemiBold',
                  color: '#9e9084',
                  textAlign: 'center',
                }}
              />
            </FlexWidget>
          ) : null} */}
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
